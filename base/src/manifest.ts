class Manifest {
  private initialize: Promise<void>

  constructor() {
    this.initialize = (async () => {
      // load existing manifest file(s) and populate
    })()
  }

  async getSchema(collection: string): Promise<any> {
    await this.initialize
  }
}

export default Manifest
