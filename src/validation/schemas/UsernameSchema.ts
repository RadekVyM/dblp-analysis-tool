import { isNullOrWhiteSpace } from '@/utils/strings'
import { z } from 'zod'

export const UsernameSchema = z
    .string()
    .min(1)
    .refine((value) => !isNullOrWhiteSpace(value), 'Name cannot be empty.');