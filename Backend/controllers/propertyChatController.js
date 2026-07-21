import { propertyModel } from '../models/propertyModel.js';
import { propertyChatModel } from '../models/propertyChatModel.js';
import {
  resolvePropertyChatRoute,
  buildPropertyChatFirstMessage,
  chatRecipientLabel,
} from '../utils/propertyChatRouting.js';
import { deliverNotification } from '../services/notificationService.js';
import { notifyStaffPropertyChat } from '../services/staffAlertService.js';

const MAX_MESSAGE_LEN = 2000;

function trimBody(body) {
  return String(body || '').trim();
}

function isPropertyChatable(property) {
  if (!property) return false;
  const status = String(property.listing_status || 'active').toLowerCase();
  return status === 'active';
}

function mapChatForUser(row, userId) {
  if (!row) return null;
  const isBuyer = Number(row.buyer_user_id) === Number(userId);
  const isRecipient = Number(row.recipient_user_id) === Number(userId);
  return {
    id: row.id,
    propertyId: row.property_id,
    channel: row.channel,
    buyerUserId: row.buyer_user_id,
    recipientUserId: row.recipient_user_id,
    listedByStaff: row.listed_by_staff,
    lastMessagePreview: row.last_message_preview,
    unreadCount: isBuyer
      ? Number(row.buyer_unread_count) || 0
      : isRecipient
        ? Number(row.recipient_unread_count) || 0
        : 0,
    viewerRole: isBuyer ? 'buyer' : isRecipient ? 'recipient' : 'buyer',
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    property: {
      id: row.property_id,
      title: row.property_title,
      imageUrl: row.property_image_url,
      location: row.property_location,
      city: row.property_city,
      type: row.property_type,
      otherType: row.property_other_type,
      listingKind: row.property_listing_kind,
    },
    buyerName: row.buyer_name,
    buyerPhone: row.buyer_phone,
    recipientName: row.recipient_name,
    recipientRole: row.recipient_role,
    recipientLabel: chatRecipientLabel(
      {
        location: row.property_location,
        city: row.property_city,
        owner_name: row.recipient_name,
      },
      { channel: row.channel }
    ),
  };
}

function mapMessage(msg, viewerUserId) {
  const isMine =
    (msg.sender_kind === 'buyer' && Number(msg.sender_user_id) === Number(viewerUserId)) ||
    (msg.sender_kind === 'user' && Number(msg.sender_user_id) === Number(viewerUserId));
  return {
    id: msg.id,
    body: msg.body,
    senderKind: msg.sender_kind,
    senderUserId: msg.sender_user_id,
    senderStaffId: msg.sender_staff_id,
    senderStaffRole: msg.sender_staff_role,
    createdAt: msg.created_at,
    isMine,
    isStaff: msg.sender_kind === 'staff',
  };
}

function mapChatForStaff(row) {
  return {
    id: row.id,
    propertyId: row.property_id,
    channel: row.channel,
    buyerUserId: row.buyer_user_id,
    buyerName: row.buyer_name,
    buyerPhone: row.buyer_phone,
    lastMessagePreview: row.last_message_preview,
    unreadCount: Number(row.staff_unread_count) || 0,
    updatedAt: row.updated_at,
    createdAt: row.created_at,
    property: {
      id: row.property_id,
      title: row.property_title,
      imageUrl: row.property_image_url,
      location: row.property_location,
      city: row.property_city,
    },
    listedByStaff: row.listed_by_staff,
  };
}

async function getChatForUserAccess(chatId, userId) {
  const chat = await propertyChatModel.findById(chatId);
  if (!chat) return { error: 'Chat not found.', status: 404 };
  const uid = Number(userId);
  const isBuyer = Number(chat.buyer_user_id) === uid;
  const isRecipient = Number(chat.recipient_user_id) === uid;
  if (!isBuyer && !isRecipient) {
    return { error: 'Access denied.', status: 403 };
  }
  return { chat, isBuyer, isRecipient };
}

async function notifyNewBuyerMessage(chat, property, firstMessage) {
  try {
    const preview = firstMessage.slice(0, 120);
    const propertyTitle = property?.title || 'Property listing';
    const buyerName = chat.buyer_name || 'A buyer';

    if (chat.channel === 'staff') {
      await notifyStaffPropertyChat({
        chatId: chat.id,
        propertyId: property?.id,
        buyerName,
        buyerPhone: chat.buyer_phone,
        propertyTitle,
        preview,
      });
      return;
    }

    if (!chat.recipient_user_id) return;

    await deliverNotification({
      userId: chat.recipient_user_id,
      type: 'property_chat',
      title: 'New inquiry on your listing',
      body: `${buyerName}: ${preview}`,
      data: {
        type: 'property_chat',
        chatId: chat.id,
        propertyId: property?.id,
        link: `/chats/${chat.id}`,
      },
      referenceKey: `property_chat_new_${chat.id}_${Date.now()}`,
      sendPush: true,
    });
  } catch (err) {
    console.error('notifyNewBuyerMessage:', err.message);
  }
}

async function notifyBuyerReply(chat, property, body, senderLabel) {
  try {
    const preview = body.slice(0, 120);
    await deliverNotification({
      userId: chat.buyer_user_id,
      type: 'property_chat',
      title: `Reply about ${property?.title || 'listing'}`,
      body: `${senderLabel}: ${preview}`,
      data: {
        type: 'property_chat',
        chatId: chat.id,
        propertyId: property?.id,
        link: `/chats/${chat.id}`,
      },
      referenceKey: `property_chat_reply_${chat.id}_${Date.now()}`,
      sendPush: true,
    });
  } catch (err) {
    console.error('notifyBuyerReply:', err.message);
  }
}

export const startPropertyChat = async (req, res) => {
  try {
    const propertyId = Number(req.body?.propertyId || req.body?.property_id);
    if (!propertyId) {
      return res.status(400).json({ error: 'Property id is required.' });
    }

    const property = await propertyModel.findById(propertyId);
    if (!property || !isPropertyChatable(property)) {
      return res.status(404).json({ error: 'Property not found or not available.' });
    }

    const userId = Number(req.user.id);
    if (property.owner_id && Number(property.owner_id) === userId) {
      return res.status(403).json({ error: 'You cannot chat on your own listing.' });
    }

    const route = resolvePropertyChatRoute(property);
    let chat = await propertyChatModel.findByPropertyAndBuyer(propertyId, userId);

    if (!chat) {
      const firstMessage = buildPropertyChatFirstMessage(property);
      const chatId = await propertyChatModel.create({
        property_id: propertyId,
        buyer_user_id: userId,
        channel: route.channel,
        recipient_user_id: route.recipient_user_id,
        listed_by_staff: route.listed_by_staff,
        last_message_preview: firstMessage,
      });

      await propertyChatModel.addMessage({
        chatId,
        senderKind: 'buyer',
        senderUserId: userId,
        body: firstMessage,
      });

      chat = await propertyChatModel.findById(chatId);
      await notifyNewBuyerMessage(chat, property, firstMessage);
    }

    const messages = await propertyChatModel.listMessages(chat.id);
    return res.json({
      chat: mapChatForUser(chat, userId),
      messages: messages.map((m) => mapMessage(m, userId)),
      created: !chat.created_at || chat.id,
    });
  } catch (err) {
    console.error('startPropertyChat:', err);
    return res.status(500).json({ error: 'Failed to start chat.' });
  }
};

export const listUserPropertyChats = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const rows = await propertyChatModel.listForUser(userId);
    return res.json({
      chats: rows.map((r) => mapChatForUser(r, userId)),
    });
  } catch (err) {
    console.error('listUserPropertyChats:', err);
    return res.status(500).json({ error: 'Failed to load chats.' });
  }
};

export const getUserPropertyChatUnreadCount = async (req, res) => {
  try {
    const userId = Number(req.user.id);
    const count = await propertyChatModel.countUnreadForUser(userId);
    return res.json({ count });
  } catch (err) {
    console.error('getUserPropertyChatUnreadCount:', err);
    return res.status(500).json({ error: 'Failed to load unread count.' });
  }
};

export const getUserPropertyChat = async (req, res) => {
  try {
    const chatId = Number(req.params.id);
    const access = await getChatForUserAccess(chatId, req.user.id);
    if (access.error) {
      return res.status(access.status).json({ error: access.error });
    }

    const messages = await propertyChatModel.listMessages(chatId);
    if (access.isBuyer) {
      await propertyChatModel.markReadForBuyer(chatId);
    } else {
      await propertyChatModel.markReadForRecipient(chatId);
    }

    return res.json({
      chat: mapChatForUser(access.chat, req.user.id),
      messages: messages.map((m) => mapMessage(m, req.user.id)),
    });
  } catch (err) {
    console.error('getUserPropertyChat:', err);
    return res.status(500).json({ error: 'Failed to load chat.' });
  }
};

export const postUserPropertyChatMessage = async (req, res) => {
  try {
    const chatId = Number(req.params.id);
    const body = trimBody(req.body?.body);
    if (!body) return res.status(400).json({ error: 'Message cannot be empty.' });
    if (body.length > MAX_MESSAGE_LEN) {
      return res.status(400).json({ error: `Message is too long (max ${MAX_MESSAGE_LEN} characters).` });
    }

    const access = await getChatForUserAccess(chatId, req.user.id);
    if (access.error) {
      return res.status(access.status).json({ error: access.error });
    }

    const { chat, isBuyer, isRecipient } = access;
    if (chat.channel === 'staff' && isRecipient) {
      return res.status(403).json({ error: 'Staff-listed properties are replied to by Harsh To Let Services.' });
    }
    if (!isBuyer && !isRecipient) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const senderKind = isBuyer ? 'buyer' : 'user';
    const messageId = await propertyChatModel.addMessage({
      chatId,
      senderKind,
      senderUserId: req.user.id,
      body,
    });

    const property = await propertyModel.findById(chat.property_id);
    if (isBuyer) {
      await notifyNewBuyerMessage(
        { ...chat, buyer_name: chat.buyer_name || req.user.name },
        property,
        body
      );
    } else {
      const label = req.user.role === 'agent' ? 'Agent' : 'Owner';
      await notifyBuyerReply(chat, property, body, label);
    }

    const messages = await propertyChatModel.listMessages(chatId);
    const created = messages.find((m) => m.id === messageId);
    return res.status(201).json({
      message: mapMessage(created, req.user.id),
      messages: messages.map((m) => mapMessage(m, req.user.id)),
    });
  } catch (err) {
    console.error('postUserPropertyChatMessage:', err);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
};

export const markUserPropertyChatRead = async (req, res) => {
  try {
    const chatId = Number(req.params.id);
    const access = await getChatForUserAccess(chatId, req.user.id);
    if (access.error) {
      return res.status(access.status).json({ error: access.error });
    }
    if (access.isBuyer) {
      await propertyChatModel.markReadForBuyer(chatId);
    } else {
      await propertyChatModel.markReadForRecipient(chatId);
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error('markUserPropertyChatRead:', err);
    return res.status(500).json({ error: 'Failed to mark read.' });
  }
};

// ——— Staff (admin / sub-admin) ———

async function getStaffChat(chatId) {
  const chat = await propertyChatModel.findById(chatId);
  if (!chat) return { error: 'Chat not found.', status: 404 };
  if (chat.channel !== 'staff') {
    return { error: 'This chat is not a staff inbox conversation.', status: 403 };
  }
  return { chat };
}

export const listStaffPropertyChats = async (req, res) => {
  try {
    const rows = await propertyChatModel.listForStaff();
    return res.json({ chats: rows.map(mapChatForStaff) });
  } catch (err) {
    console.error('listStaffPropertyChats:', err);
    return res.status(500).json({ error: 'Failed to load property chats.' });
  }
};

export const getStaffPropertyChatUnreadCount = async (req, res) => {
  try {
    const count = await propertyChatModel.countUnreadForStaff();
    return res.json({ count });
  } catch (err) {
    console.error('getStaffPropertyChatUnreadCount:', err);
    return res.status(500).json({ error: 'Failed to load unread count.' });
  }
};

export const getStaffPropertyChat = async (req, res) => {
  try {
    const chatId = Number(req.params.id);
    const result = await getStaffChat(chatId);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    await propertyChatModel.markReadForStaff(chatId);
    const messages = await propertyChatModel.listMessages(chatId);
    return res.json({
      chat: mapChatForStaff(result.chat),
      messages: messages.map((m) => ({
        id: m.id,
        body: m.body,
        senderKind: m.sender_kind,
        senderUserId: m.sender_user_id,
        senderStaffId: m.sender_staff_id,
        senderStaffRole: m.sender_staff_role,
        createdAt: m.created_at,
        isMine: m.sender_kind === 'staff',
        isStaff: m.sender_kind === 'staff',
      })),
    });
  } catch (err) {
    console.error('getStaffPropertyChat:', err);
    return res.status(500).json({ error: 'Failed to load chat.' });
  }
};

export const postStaffPropertyChatMessage = async (req, res) => {
  try {
    const chatId = Number(req.params.id);
    const body = trimBody(req.body?.body);
    if (!body) return res.status(400).json({ error: 'Message cannot be empty.' });
    if (body.length > MAX_MESSAGE_LEN) {
      return res.status(400).json({ error: `Message is too long (max ${MAX_MESSAGE_LEN} characters).` });
    }

    const result = await getStaffChat(chatId);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    const staffRole = req.user.isAdmin ? 'admin' : 'subadmin';
    const messageId = await propertyChatModel.addMessage({
      chatId,
      senderKind: 'staff',
      senderStaffId: req.user.id,
      senderStaffRole: staffRole,
      body,
    });

    const property = await propertyModel.findById(result.chat.property_id);
    await notifyBuyerReply(result.chat, property, body, 'Harsh To Let Services');

    const messages = await propertyChatModel.listMessages(chatId);
    const created = messages.find((m) => m.id === messageId);
    return res.status(201).json({
      message: {
        id: created.id,
        body: created.body,
        senderKind: created.sender_kind,
        createdAt: created.created_at,
        isMine: true,
        isStaff: true,
      },
      messages: messages.map((m) => ({
        id: m.id,
        body: m.body,
        senderKind: m.sender_kind,
        senderUserId: m.sender_user_id,
        senderStaffId: m.sender_staff_id,
        senderStaffRole: m.sender_staff_role,
        createdAt: m.created_at,
        isMine: m.sender_kind === 'staff',
        isStaff: m.sender_kind === 'staff',
      })),
    });
  } catch (err) {
    console.error('postStaffPropertyChatMessage:', err);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
};

export const markStaffPropertyChatRead = async (req, res) => {
  try {
    const chatId = Number(req.params.id);
    const result = await getStaffChat(chatId);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    await propertyChatModel.markReadForStaff(chatId);
    return res.json({ ok: true });
  } catch (err) {
    console.error('markStaffPropertyChatRead:', err);
    return res.status(500).json({ error: 'Failed to mark read.' });
  }
};
