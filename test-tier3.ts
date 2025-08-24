// This file has severe corruption to force Tier 3
export class BadFile {
  method(): string {
    return 'unterminated string
  }
  
  anotherMethod( {
    // missing params
    const x = ;
    return
  }
}