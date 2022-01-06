console.log('usm2.js loaded')

usm = function(seq='acggctagagctag',abc){
    if(typeof(seq)=='object'){
        Object.assign(this,seq)
    }else{
        this.seq=seq
    }
    abc=abc||usm.unique(this.seq)
    this.edges=usm.edges(abc)
    usm.iterate(this)
    this.plot=function(size=200,direction="forward",that=this,){
        return usm.plot(that,size,direction)
    }
}

usm.resolveSeq=async function(seq){
    let res={seq:seq}
    if(seq.match(/^http[s]*:\/\//)){ // if it is a url
        res.url=seq
        res.seq = await (await fetch(seq)).text()
    }
    if(res.seq.match(/^>[^\n\r]*/)){ // if fastA
        res.name = res.seq.match(/^>[^\n\r]*/)[0]
        res.seq=res.seq.replace(/^>[^\n\r]*/,'').replace(/[\n\r]/g,'')
    }
    return res
}

usm.unique=seq=>[...new Set(seq)]

usm.rep=(v=0,n=2)=>[...new Array(n)].map(_=>v) // replicate v n times

usm.range=((n,i0=0,d=1)=>[...Array(n)].map((_,i)=>i*d+i0)) // array with n numbers at d intervals starting with i0 

usm.int2bin=(v,n=Math.floor(Math.log2(v))+1)=>{ // integer to binary as an array of length n
    let bb=usm.rep(0,n)
    for(var i in bb){
        let k = 2**(n-i-1)
        if(v>=k){
            bb[i]=1
            v-=k
        }
    }
    return bb
}

usm.edges=ab=>{ // calculate compact edges of an alphabet
    const n = Math.ceil(Math.log2(ab.length)) // dimensions needed for compact notation
    //const m = ab.length // alphabet length
    const edges={}
    ab.forEach((a,i)=>{
        edges[a]=usm.int2bin(i,n)
        if(edges[a].length==0){
            edges[a]=[0]
        }
    })
    return edges //usm.range(m).map(v=>usm.int2bin(v,n))
}

usm.iterate=(u)=>{
    u.forward=[]
    u.backward=[]
    const n=u.seq.length
    u.edges[Object.keys(u.edges)[0]].forEach((_,d)=>{ // for each dimension
        console.log(`iterating dimension ${d}`)
        u.forward[d]=usm.rep(0.5,n)
        u.backward[d]=usm.rep(0.5,n)
        let funForward = function(m=n){
            u.forward[d][0]=u.backward[d][0]+(u.edges[u.seq[0]][d]-u.backward[d][0])/2
            for(let i=1 ; i<m ; i++){
                u.forward[d][i]=u.forward[d][i-1]+(u.edges[u.seq[i]][d]-u.forward[d][i-1])/2
            }    
        }
        let funBackward = function (){
            u.backward[d][n-1]=u.forward[d][n-1]+(u.edges[u.seq[n-1]][d]-u.forward[d][n-1])/2
            for(let i=n-2 ; i>=0 ; i--){
                u.backward[d][i]=u.backward[d][i+1]+(u.edges[u.seq[i]][d]-u.backward[d][i+1])/2
            }    
        }
        funForward()
        funBackward()
        // close seeding circularity
        funForward( n>100 ? 100 : n )
        const L = Math.floor(100/n)
        if(L>0&d==0){console.log(`short sequence, looped ${L} times`)}
        for(let k=0 ; k < 100/n ; k++){
            //console.log(`short sequence, looping ${k}`)
            funBackward()
            funForward()
        }
    })
    return u
}

usm.plot=function(u,size=200,direction="forward"){
    let cv = document.createElement('canvas')
    cv.width=cv.height=size
    cv.style.border="1px solid black"
    let ctx = cv.getContext('2d')
    ctx.fillStyle = 'rgb(255, 255, 255)'
    ctx.fillRect(0,0,size,size) // white background
    ctx.fillStyle = 'rgb(0, 0, 0)' // black map points
    let xy=u[direction]
    xy[0].forEach((_,i)=>{
        ctx.fillRect(Math.floor(xy[0][i]*size), Math.floor(xy[1][i]*size), 1, 1);
        //debugger
    })
    //debugger
    return cv
}

// --------------------//

//u = new usm()

if(typeof (define) != 'undefined'){
    define(_=>usm)
}