import { Link } from 'react-router-dom';
import { UserCircle } from 'lucide-react';

export function getAgentListingInfo(property) {
  if ((property?.owner_role || '').toLowerCase() !== 'agent') return null;
  const name = property.broker_name || property.owner_name || 'Agent';
  const publicId = property.broker_public_id;
  return {
    name,
    publicId,
    profileUrl: publicId ? `/broker/${publicId}/properties` : null,
  };
}

const AgentListingInfo = ({ property, variant = 'card' }) => {
  const agent = getAgentListingInfo(property);
  if (!agent) return null;

  if (variant === 'detail') {
    if (!agent.profileUrl) return null;
    return (
      <Link
        to={agent.profileUrl}
        className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-gold hover:underline"
      >
        <UserCircle className="h-3.5 w-3.5" />
        View agent profile
      </Link>
    );
  }

  return (
    <div className="mt-2 pt-2 border-t border-gray-light/60">
      <p className="text-xs text-gray">
        Listed by agent: <span className="font-semibold text-navy">{agent.name}</span>
      </p>
      {agent.profileUrl && (
        <Link
          to={agent.profileUrl}
          className="inline-flex items-center gap-1 mt-0.5 text-[11px] font-semibold text-gold hover:underline"
        >
          <UserCircle className="h-3 w-3" />
          Agent profile
        </Link>
      )}
    </div>
  );
};

export default AgentListingInfo;
