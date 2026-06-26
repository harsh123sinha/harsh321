import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { X } from 'lucide-react';

import BrokerFigureAnimation from './BrokerFigureAnimation';



const SESSION_KEY = 'hts-broker-modal-dismissed';



const FirstTimePatnaModal = () => {

  const [visible, setVisible] = useState(false);

  const navigate = useNavigate();



  useEffect(() => {

    const onTeaserDone = () => {

      if (sessionStorage.getItem(SESSION_KEY) === '1') return;

      setVisible(true);

    };

    window.addEventListener('hts:chat-teaser-finished', onTeaserDone);

    return () => window.removeEventListener('hts:chat-teaser-finished', onTeaserDone);

  }, []);



  const dismiss = () => {

    sessionStorage.setItem(SESSION_KEY, '1');

    setVisible(false);

  };



  const goBroker = () => {

    dismiss();

    navigate('/broker');

  };



  if (!visible) return null;



  return (

    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-navy/60 backdrop-blur-sm px-4">

      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl text-center">

        <button

          type="button"

          onClick={dismiss}

          className="absolute top-4 right-4 p-1 rounded-full text-gray hover:bg-gray-100"

          aria-label="Close"

        >

          <X className="h-5 w-5" />

        </button>

        <div className="flex justify-center mb-4">

          <BrokerFigureAnimation className="h-28 w-28" />

        </div>

        <h2 className="text-2xl font-bold text-navy mb-3">First time in Patna?</h2>

        <p className="text-gray mb-8 leading-relaxed">

          Let Harsh To Let Services&apos; verified broker help you find your best home.

        </p>

        <button

          type="button"

          onClick={goBroker}

          className="w-full bg-gold text-navy py-3 rounded-lg font-bold hover:bg-gold/90 transition-colors"

        >

          Find your broker

        </button>

      </div>

    </div>

  );

};



export default FirstTimePatnaModal;

