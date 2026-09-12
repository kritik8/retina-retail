import path from 'node:path'
import fs from 'node:fs'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

function cctvVideoPlugin(): Plugin {
  return {
    name: 'cctv-video-server',
    configureServer(server) {
      server.middlewares.use('/cctv-videos', (req, res, next) => {
        const urlPath = decodeURIComponent(req.url?.split('?')[0] || '')
        const filename = path.basename(urlPath)
        const possiblePaths = [
          path.resolve(__dirname, '../../CCTV Footage', filename),
          path.resolve(__dirname, '../../cctv-footage', filename),
          path.resolve(__dirname, '../..', filename),
        ]
        const videoPath = possiblePaths.find(p => fs.existsSync(p))
        if (!videoPath) {
          return next()
        }

        const stat = fs.statSync(videoPath)
        const fileSize = stat.size
        const range = req.headers.range

        if (range) {
          const parts = range.replace(/bytes=/, '').split('-')
          const start = parseInt(parts[0], 10)
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
          const chunksize = end - start + 1
          const file = fs.createReadStream(videoPath, { start, end })
          const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
            'Access-Control-Allow-Origin': '*',
          }
          res.writeHead(206, head)
          file.pipe(res)
        } else {
          const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
            'Accept-Ranges': 'bytes',
            'Access-Control-Allow-Origin': '*',
          }
          res.writeHead(200, head)
          fs.createReadStream(videoPath).pipe(res)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), cctvVideoPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
