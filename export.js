async function loadScript(url) {
    let load = new Promise((resolve, reject) => {
        let s = document.createElement('script');
        s.src = url;
        s.onload = resolve;
        document.head.appendChild(s);
    });
    return load
};

//await loadScript("http://localhost:8000/usm2/usm2.js");
await loadScript("https://usm.github.io/2/usm2.js");



const usm2=usm

export {
    usm2
}
