import { Link } from 'react-router-dom';

interface GradeCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  link: string;
}

const GradeCard = ({ title, subtitle, description, icon, link }: GradeCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200">
      <div className="text-5xl mb-3">{icon}</div>
      <h3 className="text-xl font-semibold mb-1">{title}</h3>
      <p className="text-code-teal font-medium mb-2">{subtitle}</p>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link
        to={link}
        className="inline-block px-4 py-2 bg-code-purple/90 text-white rounded-md text-sm font-medium hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-code-purple/30 transition-colors"
      >
        Khám phá {title}
      </Link>
    </div>
  );
};

export default GradeCard;
