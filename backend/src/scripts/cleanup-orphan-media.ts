import { mediaCleanupService } from '../modules/media/services/cleanup.service'

const main = async () => {
  const result = await mediaCleanupService.cleanupOrphanMedia()
  console.log(JSON.stringify(result, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
