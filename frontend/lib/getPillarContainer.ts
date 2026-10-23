import { client } from '@/sanity/lib/client';
import { PillarContainer_Query } from '@/sanity/lib/queries';
import { cache } from 'react';
import { protectEins } from '@/lib/ein';


export const getPillarContainer = cache(async () => {
    const pillarContainer = protectEins(await client.fetch(PillarContainer_Query));
    return pillarContainer;  
    
   
});


