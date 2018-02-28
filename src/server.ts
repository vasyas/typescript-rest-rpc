export function post() {
    return (target: Function, key: string, value: any) => {
        console.log(key);
    }
}