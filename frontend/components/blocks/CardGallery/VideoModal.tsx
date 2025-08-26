import { useEffect, useRef, useState } from 'react'
import Headline from '@/components/atoms/Headline';
import styles from "./VideoModal.module.css"
// import { FaRegWindowClose } from "react-icons/fa";


type VideoModalProps = {
  url: string;
  title: string;
};

const VideoModal = ({url, title}: VideoModalProps) => {

  const [isMountedModal, setIsMountedModal] = useState(false);

    const handleToggle = () => {
      setIsMountedModal(!isMountedModal);
      console.log("TEST: ", "Button click success")
    }

    const getYoutubeOrGoogleUrl = (url: string) => {
      if (!url) return '';
      if (url.includes("youtube")) {
        const fileIdString = url.split('?v=');
        const fileId = fileIdString[1].split("&").shift()
        return `https://www.youtube.com/embed/${fileId}/preview`;
      } else {
        const fileId = url.split('/')[5];
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }

    const VideoPlayer = () => (
      <div className={styles.videoWrapper}>
        {/* {title && <Headline tag='h2' text={title} className={styles.videoTitle} />} */}
        <iframe
          src={getYoutubeOrGoogleUrl(url)}
          className={styles.video}
          title={title}
          allow='autoplay; encrypted-media'
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    )

    return (
      <div className={styles.modalWrapper}>
        <div className={styles.modalContent}>

        <VideoPlayer/>
      </div>
    </div>
    );
}


export default VideoModal;
