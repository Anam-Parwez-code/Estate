const CLOUDINARY_UPLOAD_SEGMENT = '/image/upload/';

export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com') || !url.includes(CLOUDINARY_UPLOAD_SEGMENT)) {
    return url;
  }

  const {
    width = 900,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options;

  const transformations = [
    'f_' + format,
    'q_' + quality,
    'c_' + crop,
    'w_' + width,
  ];

  if (height) transformations.push('h_' + height);

  return url.replace(
    CLOUDINARY_UPLOAD_SEGMENT,
    `${CLOUDINARY_UPLOAD_SEGMENT}${transformations.join(',')}/`
  );
};

export const getResponsiveImageSrcSet = (url, widths = [360, 640, 900, 1200]) =>
  widths
    .map((width) => `${getOptimizedImageUrl(url, { width })} ${width}w`)
    .join(', ');

