export default class DeepFind {
  constructor (
    public obj: Record<string, any> | any[],
    public comparator: (v1: any, v2: any) => boolean = (v1, v2) => v1 === v2
  ) {}

  findValue (v: any) {
    const output = [] as any[]
    this._findValue(v, output, this.obj)
    return output
  }

  findKey (k: string) {
    const output = [] as any[]
    this._findKey(k, output, this.obj)
    return output
  }

  findKeyValue (k: string | number, v: any) {
    const output = [] as any[]
    if (typeof k === 'number') {
      this._findKeyValueArray(k, v, output, this.obj)
    } else {
      this._findKeyValueObject(k, v, output, this.obj)
    }
    return output
  }

  private _findValue (v: any, acc: any[], current: any, parent: any = this.obj) {
    if (Array.isArray(current)) {
      for (const c0 of current) {
        this._findValue(v, acc, c0, current)
      }
    } else if (isPlainObject(current)) {
      for (const c0 of Object.values(current)) {
        this._findValue(v, acc, c0, current)
      }
    } else if (this.comparator(current, v)) {
      acc.push(parent)
    }
  }

  private _findKey (k: any, acc: any[], current: any) {
    if (Array.isArray(current)) {
      for (const c0 of current) {
        this._findKey(k, acc, c0)
      }
    } else if (isPlainObject(current)) {
      for (const [k0, c0] of Object.entries(current)) {
        if (this.comparator(k0, k)) {
          acc.push(current)
        }
        this._findKey(k, acc, c0)
      }
    }
  }

  private _findKeyValueArray (n: number, v: any, acc: any[], current: any) {
    if (Array.isArray(current)) {
      if (this.comparator(current[n], v)) {
        acc.push(current)
      }

      for (const c0 of current) {
        this._findKeyValueArray(n, v, acc, c0)
      }
    } else if (isPlainObject(current)) {
      for (const c0 of Object.values(current)) {
        this._findKeyValueArray(n, v, acc, c0)
      }
    }
  }

  private _findKeyValueObject (k: string, v: any, acc: any[], current: any) {
    if (Array.isArray(current)) {
      for (const c0 of current) {
        this._findKeyValueObject(k, v, acc, c0)
      }
    } else if (isPlainObject(current)) {
      if (this.comparator(current[k], v)) {
        acc.push(current)
      }

      for (const c0 of Object.values(current)) {
        this._findKeyValueObject(k, v, acc, c0)
      }
    }
  }
}

function isPlainObject (obj: any) {
  return !!obj && obj.toString() === '[object Object]'
}
