import { cache } from 'react';
import { PopUpModal } from '@/sanity/types';
import { POPUPMODAL_QUERY } from '@/sanity/lib/queries';
import { sanityFetch } from '@/sanity/lib/fetch';

export const getPopUpModal = cache(async () => {
    const popUpModal = await sanityFetch<PopUpModal>(POPUPMODAL_QUERY);

    if (!popUpModal) return [];

    return popUpModal;
});
