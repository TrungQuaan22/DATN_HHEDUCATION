import { mediaRepository } from '~/modules/media/repository'

import { blogRepository } from './repository'
import { AdminBlogService } from './services/admin.service'
import { PublicBlogService } from './services/public.service'

export const adminBlogService = new AdminBlogService(blogRepository, mediaRepository)
export const publicBlogService = new PublicBlogService(blogRepository)
