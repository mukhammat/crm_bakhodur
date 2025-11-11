export class Container {
    private containerMap = new Map<string, unknown>();

    register = <T, Args extends unknown[]>(
        title: string,
        Cla: new (...args: Args) => T,
        ...args: Args
    ): void => {
        this.containerMap.set(title, new Cla(...args));
    };

    get = <T>(title: string): T => {
        const instance = this.containerMap.get(title);
        if (!instance) throw new Error(`No instance registered for "${title}"`);
        return instance as T;
    };
}

// class Car {
//     constructor(private title: string) {}
//     get = () => this.title;
// }

// const c = new Container();
// c.register('car', Car, 'Toyota');

// const car = c.get<Car>('car');
// console.log(car.get());
