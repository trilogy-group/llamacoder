export const runtime = "nodejs";

export async function GET(request: Request) {
    const apiDocs = `
openapi: 3.0.0
info:
  title: Audio/Video Transcription API
  version: 1.0.0
  description: API for transcribing audio/video files using AWS Transcribe

servers:
  - url: https://artifacts.ti.trilogy.com/

paths:
  /api/transcribe:
    post:
      summary: Transcribe an audio/video file
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
      responses:
        '200':
          description: Successful transcription
          content:
            application/json:
              schema:
                type: object
                properties:
                  message:
                    type: string
                  jobName:
                    type: string
                  transcript:
                    type: object
                    properties:
                      transcripts:
                        type: array
                        items:
                          type: object
                          properties:
                            transcript:
                              type: string
                      items:
                        type: array
                        items:
                          type: object
                          properties:
                            id:
                              type: integer
                            type:
                              type: string
                            alternatives:
                              type: array
                              items:
                                type: object
                                properties:
                                  confidence:
                                    type: string
                                  content:
                                    type: string
                            start_time:
                              type: string
                            end_time:
                              type: string
        '400':
          description: Bad request
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
        '500':
          description: Internal server error
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
`
    const response = JSON.stringify({ apiDocs });
    return new Response(response, {
        headers: new Headers({
            "Content-Type": "text/plain",
            "Cache-Control": "no-cache",
        }),
    });
}
