'use client'

import React from 'react'
import type { PopUpModal as PopUpModalType } from '@/sanity/types';
import styles from "./PopUpModal.module.css";
import { useEffect, useRef } from 'react'
import { LinkAtom } from './atoms/Link';
import Headline from './atoms/Headline';
import SanityNextImage from './SanityNextImage';
import { ReferenceType } from './atoms/Link';


type PopUpModalProps = {
    popUpModalData: PopUpModalType;
};

// Attn: Modal should not cover up carousel nav buttons
// Add onclick activity for modal like open/close
// Fix CTA not rendering
// Styling stuff

const PopUpModal = ({ popUpModalData }: PopUpModalProps) => {
    return (
        <div className={styles.modalWrapper}>

            <div className={styles.modalContent}>
                {popUpModalData.title ? <Headline tag='h4' text={popUpModalData.title || ''}/> : null}
                {popUpModalData.body ? <p>{popUpModalData.body || ''}</p> : null}
                {popUpModalData.image ?
                    <div className={styles.imageWrapper}>
                        <SanityNextImage image={popUpModalData.image}  fit='cover' sizes='80'/>
                    </div> : null}
                {popUpModalData.CTA ?
                    <LinkAtom
                        ariaLabel={popUpModalData.CTA.title || 'Untitled'}
                        isExternalLink={popUpModalData.CTA.isExternalLink}
                        url={popUpModalData.CTA.url}
                        reference={popUpModalData.CTA.reference as any as ReferenceType}
                        className={styles.popupCTA}
                        title={popUpModalData.CTA.title}
                        target={popUpModalData.CTA.target}
                    /> : null}
            </div>
        </div>
    )
}

export default PopUpModal
