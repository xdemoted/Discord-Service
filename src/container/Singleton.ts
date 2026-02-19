type SingletonStatics<T> = {
  instance?: T
  getInstance(): T
}

export function Singleton<T extends new (...args: any[]) => any>(ctor: T) {
  type Instance = InstanceType<T>

  class Wrapped extends ctor {
    static instance: Instance
    static singleton = true

    static getInstance(...args: any[]): Instance {
      if (!this.instance) {
        this.instance = new this(...args)
      }
      return this.instance
    }
  }

  Object.defineProperty(Wrapped, 'name', { value: ctor.name })

  return Wrapped as unknown as T & SingletonStatics<Instance>
}
