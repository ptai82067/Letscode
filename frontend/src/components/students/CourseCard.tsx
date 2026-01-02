interface CourseCardProps {
  name: string;
  description: string;
  icon: string;
  lessons: number;
  onClick?: () => void;
}

const CourseCard = ({ name, description, icon, lessons, onClick }: CourseCardProps) => {
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
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200"
    >
      <div className="flex items-start space-x-3">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-base mb-1 text-gray-900">{name}</h3>
          <p className="text-gray-600 text-sm mb-2">{description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{lessons} bài học</span>
            <div className="w-24 bg-gray-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
