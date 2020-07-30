// TODO test will fail (hey, it's TDD after all)
const request = require('supertest')
const app = require('../app')
const tempVidPath = 'test_assets/file_example_MP4_1920_18MG.mp4';
const tempLocation = 0.456

describe('Image Extraction Endpoints', () => {
    it('should be the right endpoint', async () => {
        const res = await request(app)
            .post('/extract-frame')
            .send({
                videoUri: tempVidPath,
                locationSecs: tempLocation
            })
        console.info(`response.text`, res.text)
        expect(res.body.success).toEqual(true)
    })
})
