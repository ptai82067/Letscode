interface InfoCardProps {
  title: string;
  description: string;
  icon: string;
}

const InfoCard = ({ title, description, icon }: InfoCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="font-bold text-xl mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default InfoCard;
