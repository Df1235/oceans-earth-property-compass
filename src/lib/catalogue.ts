import { queryOptions } from '@tanstack/react-query';
import { getCatalogue } from './catalogue.functions';
export const catalogueOptions = queryOptions({queryKey:['catalogue'],queryFn:()=>getCatalogue(),staleTime:30_000});