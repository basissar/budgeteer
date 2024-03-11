
class Container {
    private dependencies: Map<any, any>;

    constructor(){
        this.dependencies = new Map();
    }

    register(name: any, dependency: any): void {
        this.dependencies.set(name, dependency);
    }

    resolve(name: any){
        const dependency = this.dependencies.get(name);
        return dependency !== undefined ? dependency : null;
    }
}

const container = new Container();

export { container };