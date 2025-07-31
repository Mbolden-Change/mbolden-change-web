import { cache } from 'react';
import { PopUpModal } from '@/sanity/types';
import { POPUPMODAL_QUERY } from '@/sanity/lib/queries';
import { client } from '@/sanity/lib/client';

export const getPopUpModal = cache(async () => {
    const popUpModal = await client.fetch<PopUpModal>(POPUPMODAL_QUERY);

    if (!popUpModal) return [];

    return popUpModal;
});
