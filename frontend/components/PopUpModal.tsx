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

import ButtonComponent from './atoms/ButtonComponent';

type PopUpModalProps = {
    popUpModalData: PopUpModalType;
};

// Attn: Modal should not cover up carousel nav buttons - DONE
// Add onclick activity for modal like open/close - DONE
// Fix CTA not rendering - DONE
// Styling stuff - DONE
// Onclick CTA, modal should close

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
        //   Collapsed State
        <div className={`${styles.modalWrapper} ${modalState === "collapsed" ? styles.minimized : ''}`}>
            {modalState === "collapsed" ? (
                <div className={styles.minimizedContent} onClick={handleToggle}>
                    {popUpModalData.image && (
                        <SanityNextImage
                            image={popUpModalData.image}
                            fit='contain'
                            sizes='60px'
                            className={styles.companyLogo}
                        />
                    )}
                </div>
            ) : (

        //   Expanded State
                <>
            <div className={styles.modalContent}>
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
                <div className={styles.topText}>
                    {popUpModalData.title ? <Headline tag='h3' text={popUpModalData.title || ''} className={styles.headline}/> : null}
                    {popUpModalData.body ? <p className={styles.body}>{popUpModalData.body || ''}</p> : null}
                </div>
                {popUpModalData.image ?
                    <div className={styles.imageWrapper}>
                        <SanityNextImage image={popUpModalData.image}  fit='cover' sizes='80' className={styles.image}/>
                    </div> : null}

                <div onClick={handleToggle}>
                    {popUpModalData.CTA ?
                        // <LinkAtom
                        //     ariaLabel={popUpModalData.CTA.title || 'Untitled'}
                        //     isExternalLink={popUpModalData.CTA.isExternalLink}
                        //     url={popUpModalData.CTA.url}
                        //     reference={popUpModalData.CTA.reference as any as ReferenceType}
                        //     className={styles.popupCTA}
                        //     title={popUpModalData.CTA.title}
                        //     target={popUpModalData.CTA.target}
                        // /> : null}
                        <ButtonComponent
                        link={popUpModalData.CTA}
                        variant='primary'
                        className={styles.popupCTA}
                        title={popUpModalData.CTA.title}
                    /> : null}
                </div>
            </div>
            </>
            )}
        </div>
    )
}

export default PopUpModal
