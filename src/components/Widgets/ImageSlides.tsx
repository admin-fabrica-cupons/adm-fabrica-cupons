import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ImageSlidesBlock } from '../../types';

interface ImageSlidesProps {
  data: ImageSlidesBlock;
}

const ImageSlides: React.FC<ImageSlidesProps> = ({ data }) => {
  const images = data.images || [];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const slideInterval = data.slideInterval || 5000;
  const showNavigation = data.showNavigation !== false;
  const showIndicators = data.showIndicators !== false;

  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, slideInterval);

    return () => clearInterval(interval);
  }, [images.length, slideInterval, isPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (images.length === 0) {
    return (
      <div className="not-prose my-12">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Nenhuma imagem adicionada ao slide
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="not-prose my-12">
      <div className="relative max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
        {/* Main Image Container */}
        <div className="relative aspect-video">
          <Image
            src={images[currentSlide]}
            alt={`Slide ${currentSlide + 1}`}
            fill
            className="object-cover transition-all duration-500 ease-in-out"
            unoptimized={images[currentSlide]?.includes('placehold.co')}
          />
          
          {/* Overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Slide Counter */}
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            {currentSlide + 1} / {images.length}
          </div>

          {/* Play/Pause Button */}
          {images.length > 1 && (
            <button
              onClick={togglePlayPause}
              className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Navigation Arrows */}
        {showNavigation && images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all backdrop-blur-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-white p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all backdrop-blur-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Indicators */}
        {showIndicators && images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-white shadow-lg scale-110'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2 overflow-x-auto px-4">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 relative overflow-hidden rounded-lg transition-all duration-300 ${
                index === currentSlide
                  ? 'ring-4 ring-blue-500 scale-105 shadow-lg'
                  : 'ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600'
              }`}
            >
              <div className="relative w-16 h-12">
                <Image
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized={image?.includes('placehold.co')}
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Optional Caption */}
      {data.content && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {data.content}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageSlides;
