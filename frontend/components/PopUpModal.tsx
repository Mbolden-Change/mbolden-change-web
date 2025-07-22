'use client'

import React from 'react'
import type { PopUpModal as PopUpModalType } from '@/sanity/types';
import styles from "./PopUpModal.module.css";
import { useEffect, useRef, useState } from 'react'
import { LinkAtom } from './atoms/Link';
import Headline from './atoms/Headline';
import SanityNextImage from './SanityNextImage';
import { ReferenceType } from './atoms/Link';
import { FaWindowMinimize } from 'react-icons/fa';

type PopUpModalProps = {
    popUpModalData: PopUpModalType;
};

// Attn: Modal should not cover up carousel nav buttons
// Add onclick activity for modal like open/close
// Fix CTA not rendering
// Styling stuff

const PopUpModal = ({ popUpModalData }: PopUpModalProps) => {

    const [modalState, setModalState] = useState("expanded");

    useEffect(() => {
        sessionStorage.setItem('modalState', modalState)
    }, [modalState])

    useEffect(() => {
        const savedState = sessionStorage.getItem('modalState');
        if (savedState) {
            setModalState(savedState)
        }
    }, []);

    const handleToggle = () => {
        const newState = modalState === "expanded" ? "collapsed" : "expanded";
        setModalState(newState)
    }
    return (
        <div className={`${styles.modalWrapper} ${modalState === "collapsed" ? styles.minimized : ''}`}>
            {modalState === "collapsed" ? (
                <div className={styles.minimizedContent} onClick={handleToggle}>
                    {popUpModalData.image && (
                        <div className={styles.logoWrapper}>
                            <SanityNextImage
                                image={popUpModalData.image}
                                fit='contain'
                                sizes='60px'
                                className={styles.companyLogo}
                            />
                        </div>
                    )}
                </div>
            ) : (

                <>
                    <div className={styles.modalHeader}>
                        <button
                            onClick={handleToggle}
                            className={styles.minimizeButton}
                            aria-label="Minimize modal"
                            type="button"
                        >
                            <FaWindowMinimize />
                        </button>
                    </div>

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
            </>
            )}
        </div>
    )
}

export default PopUpModal
