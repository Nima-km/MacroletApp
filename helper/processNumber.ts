

export function processNumber(inp : number) {
    'worklet';
    inp = Math.floor(inp)
    return inp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
