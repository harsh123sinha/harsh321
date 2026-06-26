import { Link } from 'react-router-dom';

import { StarRatingDisplay } from './StarRating';

import { brokerInitials } from '../../utils/brokerHelpers';



const BrokerCard = ({ broker }) => (

  <div className="w-full rounded-xl border-2 border-gray-light bg-white p-4 shadow-sm hover:border-gold/40 hover:shadow-md transition-all">

    <div className="flex gap-4">

      <div className="flex-shrink-0 h-16 w-16 rounded-full bg-navy text-gold flex items-center justify-center text-lg font-bold overflow-hidden">

        {broker.photoUrl ? (

          <img src={broker.photoUrl} alt="" className="h-full w-full object-cover" />

        ) : (

          brokerInitials(broker.name)

        )}

      </div>

      <div className="min-w-0 flex-1">

        <h3 className="font-bold text-navy truncate">{broker.name}</h3>

        <p className="text-xs text-gray font-mono mt-0.5">{broker.brokerId}</p>

        <p className="text-sm text-gray-darker mt-1 line-clamp-2">{broker.areaOfWork}</p>

        <p className="text-xs text-gray mt-1">{broker.yearsOfExperience} yrs experience</p>

      </div>

    </div>



    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-light/80">

      <StarRatingDisplay value={broker.harshRating} label="Harsh To Let rating" />

      <StarRatingDisplay value={broker.customerRating} label="Customer rating" />

    </div>



    <Link

      to={`/broker/${broker.brokerId}/properties`}

      className="mt-4 block w-full text-center bg-gold text-navy py-2.5 px-4 rounded-lg font-semibold text-sm hover:bg-gold/90 transition-colors"

    >

      Show all listings by {broker.name}

    </Link>

  </div>

);



export default BrokerCard;

