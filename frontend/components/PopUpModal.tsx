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
import { PiArrowSquareUpLeftBold } from "react-icons/pi";
import ButtonComponent from './atoms/ButtonComponent';
import ActionNetworkModal from './blocks/ActionNetworkModal/ActionNetworkModal';

type PopUpModalProps = {
    popUpModalData: PopUpModalType;
};

const PopUpModal = ({ popUpModalData }: PopUpModalProps) => {

    const [modalState, setModalState] = useState("expanded");
    const [isActionNetworkModalOpen, setIsActionNetworkModalOpen] = useState(false)

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


    const handleCTAClick = (e: React.MouseEvent) => {
        if (popUpModalData.openActionNetworkModal) {
            e.preventDefault();
            setIsActionNetworkModalOpen(true);
        } else {
            setModalState("collapsed");
        }
    };


    if (popUpModalData.visibility) {
        return (
            //   Collapsed State



                <div className={`${modalState === "collapsed" ? styles.minimized : styles.modalWrapper}`}>
                {modalState === "collapsed" ? (
                    <div  onClick={handleToggle}>
                    {popUpModalData.image  &&  (
                        <div className={styles.minimized}>
                        <SanityNextImage
                        image={popUpModalData.image}
                        fit='contain'
                        sizes='60px'
                        className={styles.companyLogo}
                        />
                        </div>
                    )}

                    <div/>
                        {!popUpModalData.image &&  (
                        <ButtonComponent
                                onClick={handleToggle}
                                className={styles.expandIcon}
                                aria-label="Minimize modal"
                                type="button"
                                variant='unstyled'
                            >
                                < PiArrowSquareUpLeftBold />
                            </ButtonComponent>
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

                    <div onClick={handleCTAClick}>
                    {popUpModalData.CTA && (
                        <ButtonComponent
                        link={popUpModalData.openActionNetworkModal ? undefined : popUpModalData.CTA}
                        variant='primary'
                        className={styles.popupCTA}
                        >
                        {popUpModalData.CTA.title}
                        </ButtonComponent>
                    )}
                    </div>
                </div>
                <ActionNetworkModal
                    isOpen={isActionNetworkModalOpen}
                    onClose={() => {
                        setIsActionNetworkModalOpen(false);
                        setModalState("collapsed");
                        }}
                />
                </>
                )}
            </div>
        )
    }
}

export default PopUpModal
