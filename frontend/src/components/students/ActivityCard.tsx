interface ActivityCardProps {
  title: string;
  description: string;
  image: string;
  duration?: string;
  onClick?: () => void;
}

const ActivityCard = ({ title, description, image, duration, onClick }: ActivityCardProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  // Check if image is a URL (starts with http or /uploads)
  const isImageUrl = image && (image.startsWith('http') || image.startsWith('/uploads'));

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200"
    >
      <div className="h-28 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-5xl overflow-hidden">
        {isImageUrl ? (
          <img src={image} alt={title} className="w-full h-full object-cover" onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
            (e.currentTarget.parentElement?.appendChild(document.createTextNode('🎯')));
          }} />
        ) : (
          image
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-base mb-1">{title}</h3>
        <p className="text-gray-600 text-sm mb-2">{description}</p>
        {duration && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
            {duration}
          </span>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;
