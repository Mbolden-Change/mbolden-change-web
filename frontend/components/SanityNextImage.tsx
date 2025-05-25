import classNames from 'classnames';
import Image from 'next/image';
import { getDimensionsFromRef, urlFor } from '@/sanity/lib/image';
import { SanityImageCrop, SanityImageHotspot } from '@/sanity/types';
import styles from './SanityNextImage.module.css';

export type SanityNextImageProps = {
  image: {
    asset?: {
      _ref?: string;
      _type?: string;
      _weak?: boolean;
    };
    hotspot?: SanityImageHotspot;
    crop?: SanityImageCrop;
    alt?: string;
    _type: 'image';
  };
  priority?: boolean;
  className?: string;
  fit?: 'cover' | 'contain';
  sizes?: string;
  aspectRatio?: number;
  width?: number;
  height?: number
};

const SanityNextImage: React.FC<SanityNextImageProps> = ({
  image,
  priority = false,
  className,
  fit,
  sizes = '100vw',
}) => {
  if (!image?.asset?._ref) {
    return null;
  }
  const { imageWidth, imageHeight } = getDimensionsFromRef(image.asset._ref);

  const imageBuilder = urlFor(image).auto('format').fit('max');

  if (imageWidth && imageHeight){
    imageBuilder.width(imageWidth).height(imageHeight);
  }

  const src = imageBuilder.url();

  return (
    <Image
      src={src}
      alt={image.alt || ''}
      width={imageWidth || 0}
      height={imageHeight || 0}
      priority={priority}
      className={classNames(
        className,
        styles.image,
        fit && styles[`fit-${fit}`]
      )}
      sizes={sizes}
    />
  );
};
export default SanityNextImage;
