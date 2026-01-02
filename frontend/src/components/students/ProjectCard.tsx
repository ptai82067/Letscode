interface ProjectCardProps {
  name: string;
  description: string;
  icon: string;
  color: string;
  onClick?: () => void;
}

const ProjectCard = ({ name, description, icon, color, onClick }: ProjectCardProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
      onClick={onClick}
      className={`${color} rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold text-lg mb-1">{name}</h3>
      <p className="text-gray-700 text-sm">{description}</p>
      <button className="mt-3 px-3 py-1.5 bg-white/90 text-sm rounded-md font-medium hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-white/50 transition-colors">
        Bắt đầu tạo
      </button>
    </div>
  );
};

export default ProjectCard;
