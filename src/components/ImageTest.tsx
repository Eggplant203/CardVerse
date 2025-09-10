import React from 'react';

const ImageTest: React.FC = () => {
  const images = [
    '/error_card.png',
    '/null_card.png',
    '/eggplant_card.png',
    '/question_mark_card.jpg',
    '/card-example-1.jpg',
    '/card-example-2.jpg',
    '/default-avatar.png'
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Static Image Test</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((imagePath, index) => (
          <div key={index} className="border rounded p-2">
            <img
              src={imagePath}
              alt={`Test image ${index + 1}`}
              className="w-full h-32 object-cover mb-2"
              onError={(e) => {
                console.error(`Failed to load image: ${imagePath}`);
                e.currentTarget.style.border = '2px solid red';
              }}
              onLoad={() => {
                console.log(`Successfully loaded image: ${imagePath}`);
              }}
            />
            <p className="text-sm text-gray-600">{imagePath}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageTest;
