function create_array(x,v){
  const vv = v || 0;
  const n = Math.abs(Math.floor(x) );
  return new Array(n).fill(vv);
}
function create_random_array(length){
  return create_array(length).random().normalize()
}
function create_random_wave(length,r,n){
  return create_random_array(length+r*n/2).xsma(r,n).slice(r*n/2,length+r*n/2).basement().normalize(0.9)
}
function correlation_coefficient(_a,_b){
  const a = _a.basement();
  const b = _b.basement();
  return a.coveriance(b)/(a.standard_deviation()*b.standard_deviation() )
}
Array.prototype.last = function(){
  if(this.length==0) return this[0]
  return this[this.length-1]
}
Array.prototype.append = function(v){
  return [...this, ...arguments]
}
Array.prototype.preppend = function(v){
  return [ ...arguments, ...this]
}
Array.prototype.dft= function() {
  console.time("dft");
  const a = this;
  const L = (new Array(a.length )).fill(0).map((v,i)=>i)
  const K = (new Array(a.length ) ).fill(0).map((v,i)=>i);
  const result = K.map(k=>{
    return L.reduce((acc,l)=>{
      const THETA = 2 * Math.PI/L.length * k * l;
      return [acc[0] + a[l] * Math.cos( THETA ) * 2 / L.length,
              acc[1] + a[l] * Math.sin( THETA ) * 2 / L.length]
    },[0,0]);
  });
  console.timeEnd("dft");
  return [result.map(v=>v[0]),result.map(v=>v[1]) ];
}
Array.prototype.reverse_dft = function(){
  const a = this[0].map((v,i)=>[v,this[1][i]] );
  const length = a.length;
  const A = a.map(v=>v[0]);
  const B = a.map(v=>v[1]);
  const L = (new Array(length)).fill(0).map((v,i)=>i);
  const N = (new Array(a.length)).fill(0).map((v,i)=>i);
  return L.map(l => {
    return N.reduce((acc,n)=>{
      const THETA = 2 * Math.PI/length * l * n ;
      return acc + ( A[n] * Math.cos(THETA) ) + ( B[n] * Math.sin(THETA) )
    },0)/2
  })
}
Array.prototype.multiply = function(data2){
  const data1 = this;
  return data1.map((v,i)=>data2[i]*v)
}
Array.prototype.amplifier = function(a){
  const data = this;
  return data.map(v=>v*a);
}
Array.prototype.addition = function(data2){
  const data1 = this;
  if(data1.length == data2.length || data1.length < data2.length){
    return data1.map((v,i)=>v+data2[i]);
  }else if(data1.length > data2.length){
    return data2.map((v,i)=>v+data1[i]);
  }
}
Array.prototype.subtraction = function(data2){
  const data1 = this;
  if(data1.length == data2.length || data1.length < data2.length){
    return data1.map((v,i)=>(v-data2[i]));
  }else if(data1.length > data2.length){
    return data2.map((v,i)=>(v-data1[i]));
  }
}
Array.prototype.delay = function(d){
  const data1 = this;
  return new Array(d+data1.length).fill(0).map((v,i)=>{
    if(i-d < 0){
      return 0
    }
    return data1[i-d]
  })
}
Array.prototype.high_pass = function(n){
  let data = this;
  const max = data.map(v=>Math.abs(v) ).max();
  data = data.map(v=>v+max);
  const data2 = data.xsma(2,n).map(v=>-1*v);
  return data.addition(data2);
}
Array.prototype.high_cut = function(n){
  const data = this
  return data.xsma(2,n);
}
Array.prototype.large = function(NN ){
  const ARRAY = this;
  NN = NN || 1;
  const N = Math.floor(NN);
  if(N<=0 || ARRAY.length==0) return NaN
  const M = ARRAY.reduce((acc,v)=>acc<v?v:acc);
  const new_array = ARRAY.filter(v=>v!==M);
  return N==1?M:new_array.large(N-1);
}
Array.prototype.large_index = function(NN ){
  const ARRAY = this;
  NN = NN || 1;
  const N = Math.floor(NN);
  if(N<=0 || ARRAY.length==0) return NaN
  const M = ARRAY.reduce((acc,v,i)=>ARRAY[acc]<v?i:acc,0);
  const new_array = ARRAY.map(v=>v==ARRAY[M]?0:v);
  return N==1?M:new_array.large_index(N-1);
}
Array.prototype.small = function(NN ){
  const ARRAY = this;
  NN = NN || 1;
  const N = Math.floor(NN);
  if(N<=0 || ARRAY.length==0) return NaN
  const M = ARRAY.reduce((acc,v)=>acc>v?v:acc);
  const new_array = ARRAY.filter(v=>v!==M);
  return N==1?M:new_array.small(N-1);
}
Array.prototype.small_index = function(NN ){
  const ARRAY = this;
  NN = NN || 1;
  const N = Math.floor(NN);
  if(N<=0 || ARRAY.length==0) return NaN
  const M = ARRAY.reduce((acc,v,i)=>ARRAY[acc]>v?i:acc,0);
  const new_array = ARRAY.map(v=>v==ARRAY[M]?Infinity:v);
  return N==1?M:new_array.small_index(N-1);
}
Array.prototype.cutting = function(n){
  if(Array.isArray(n) ){
    const x = n[0];
    const y = n[1];
    return this.reduce((acc,v)=>acc.append(v.cutting(x).map(v=>[v])),[]).reduce((acc,v,row)=>{
      if(acc.length==0 || row%y==0) return acc.append(v)
      acc[acc.length-1] = acc[acc.length-1].map((matrix,i)=>[...matrix, ...v[i] ] )
      return acc
    },[])
  }
  return this.reduce((acc,v,i)=>{
    if(acc[acc.length-1].length>=n){
      acc.push([]);
    }
    acc[acc.length-1].push(v);
    return acc
  },[[]]);
}
Array.prototype.average = function(){
  if(this.length ==0 ) return 0
  return this.reduce((acc,v)=>acc+v)/this.length;
}
// 幅が一定なパターン
Array.prototype.sma = function(n){
  const pp = Math.floor(n);
  const self = this;
  return self.map((v,ii)=>{
    let i = ii+1;
    let st = i-pp < 0 ? 0 : Math.floor(i-pp);
    let en = Math.floor(i);
    let seed = [];
    if(st==0){
      en = pp;
      seed = self.slice(st,en);
    }else{
      seed = self.slice(st,en);
    }
    //console.log(st,en,i,seed);
    return seed.reduce((acc,v)=>acc+v)/pp;
  });
}
/* duが可変するパターン
Array.prototype.sma = function(n){
  const pp = Math.floor(n);
  const self = this;
  return self.map((v,i)=>{
    let st = i-pp < 0 ? 0 : Math.floor(i-pp);
    let en = Math.floor(i+pp )+1;
    let du = self.slice(st,en).length;
    return self.slice(st,en).reduce((acc,v)=>acc+v)/du;
  });
}
*/
Array.prototype.xsma = function(n,i){
  i = i || 1;
  if(i<=1) return this.sma(n)
  return this.xsma(n,i-1).sma(n);
}
Array.prototype.min = function(){

  return this.small(1);
}
Array.prototype.max = function(){

  return this.large(1);
}
Array.prototype.normalize = function(n){
  n = n || 1;
  const temp = this;
  const max = temp.map(v=>Math.abs(v)).max();
  return temp.map(v=>n*v/max);
}
Array.prototype.split_zerocross = function(_min){
  const data = this;
  _min = _min || 0;
  let temp = 0;
  return data.detect_zerocross().reduce((acc,v,i,self)=>{
    if(v+1-temp > _min){
      acc.push( data.slice(temp,v+1) );
      temp = v+1;
    }
    return acc;
  },[])
}
Array.prototype.detect_zerocross = function(){
  const data = this;
  let temp = 0;
  let asc = false;
  let sum = [];
  return data.reduce((acc,v,i,self)=>{
    if(temp > 0 && v < 0) {
      acc.push(i-1);
    }else if(temp < 0 && v > 0){
      acc.push(i-1);
    }else if(i == self.length -1){
      acc.push(i)
    }
    temp = v;
    return acc
  },[])
}
Array.prototype.detect_vertex = function(){
  const data = this;
  let temp = 0;
  let asc = false;
  return data.reduce((acc,v,i,self)=>{
    if(i==0) {
      acc.push([v,0]);
      temp = v;
      return acc
    }
    if(temp > v && asc == true ) {
      asc = false;
      acc.push([temp,i==0?0:i-1]);
    }else if(temp < v  && asc == false  ) {
      asc = true;
      acc.push([temp,i==0?0:i-1]);
    }
    if(i==self.length-1){
      acc.push([v,self.length-1]);
    }
    temp = v;
    return acc
  },[]);
}
Array.prototype.liner_trans=function(_length){
  const length = _length||this.last()[1]||1;
  const original_length = this.last()[1]||1;
  const data = this.map(v=>[v[0],Math.floor(length*v[1]/original_length)  ] );
  const result = [this[0][0]];
  data.forEach(d=>{
    const v = d[0];
    const i = d[1]<0?0:d[1];
    const dur = i - result.length + 1;
    const gap = (v - result[result.length - 1]) / dur;
    new Array(dur).fill(0).forEach(v=>{
      result.push( result[result.length - 1] + gap );
    })
  });
  return result
}
Array.prototype.pulse_trans = function(){
  const data = this;
  const result = new Array(data[data.length -1][1]).fill(0);
  data.forEach(d=>{
    const v = d[0];
    const i = d[1];
    result[i] = v;
  });
  return result
}
Array.prototype.diff = function() {
  const data1 = this.slice(0,this.length/2);
  const data2 = this.slice(this.length/2, this.length);
  if(data1.length == 0) return 0
  const d = data1.map((v,i)=>Math.abs(v-data2[i]) );
  const r = d.reduce((acc,v)=>acc+v)/d.length;
  return r
}
Array.prototype.diff_duration= function (min_length) {
  const min = min_length;
  const max = this.length;
  const data = this;
  const r = create_array(max).map((v,i)=>{
    if(i<min){
      return 0
    }else{
      return data.slice(0,i).diff();
    }
  });
  return r
}
Array.prototype.elastic_split = function (_min,_dur,_n){
  const min = _min||100;
  const dur = _dur||1000;
  const n = _n||5;
  const result = [[]];
  const data = this.concat();
  let similarity,temp,length,_length;
  let flag = false;
  _length = _min;
  while(data.length>dur){
    similarity = data.slice(0,dur).diff_duration(min).detect_vertex().liner_trans().detect_vertex().pulse_trans();
    length = create_array(n).map((v,i)=>i+1).map(v=>similarity.small_index(v+1) ).reduce((acc,v)=>Math.abs(v-_length)<acc[1]?[v,Math.abs(v-_length)]:acc,[0,Infinity])[0];
    //console.log(similarity.slice(_min,similarity.length));
    if(length<_min)length=_min;
    _length = length;
    temp = data.splice(0, length);
    result.push(temp);
  }
  result.push(data);
  result.shift();
  return result
}
Array.prototype.stretch = function(l){
  let after_length = l||1000;
  let before_length = this.length;
  let vertex = this.map((v,i)=>[v,i] );
  vertex = vertex.map(v=>[v[0],  v[1]*(after_length-1)/(before_length-1) ]);
  return vertex.liner_trans();
}
Array.prototype.coveriance = function(_data){
  const data1 = this;
  const data2 = _data;
  if(!Array.isArray(data1) || !Array.isArray(data2) ) return 0
  const ave1 = data1.average();
  const ave2 = data2.average();
  const data1h = data1.map(v=>v-ave1);
  const data2h = data2.map(v=>v-ave2).stretch(data1h.length);
  return data1h.multiply(data2h).average();
}
Array.prototype.standard_deviation = function(){
  const data = this.basement();
  return Math.sqrt(data.map(v=>v**2).average() );
}
Array.prototype.covariance = function(_a) {
  const b = this.basement();
  const a = _a.basement();
  return b.multiply(a).average()
}
Array.prototype.distortion = function(_a) {
  const data = this;
  const rank = this.concat().sort((a,b)=>a-b);
  const max = data.max();
  const a = _a || 100;
  const bord = create_array(a).map((v,i)=> data[Math.floor(i/a * data.length)] );
  //console.log(bord);
  return data.map(v=>{
    let res = 0;
    bord.some(b=>{
      if(v>b) res = b;
      return v<b
    })
    return res
  });
}
Array.prototype.deviation = function(){
  const data = this;
  const ave = data.average();
  return data.map(v=>v-ave);
}
Array.prototype.sin = function(n, gain, sampling_rate) {
  const data = this;
  const length = sampling_rate || this.length;
  gain = gain === undefined ? 1:gain;
  n = n || 1;
  return data.map((v,i)=>v+Math.sin(n *  2 * Math.PI * i / length)*gain )
}
Array.prototype.cos = function(n, gain, sampling_rate) {
  const data = this;
  const length = sampling_rate || this.length;
  gain = gain === undefined ? 1:gain;
  n = n || 1;
  return data.map((v,i)=>v+Math.cos(n *  2 * Math.PI * i / length)*gain )
}
Array.prototype.cross_fade = function(l,n){
  n = n || 10;
  l = l || 10;
  const data = this;
  const length = this.length;
  const seed = create_array(100).map((v,i,self)=>(i<l || self.length-l-1 < i )?0:1);
  const env = seed.xsma(2,n).stretch(length).map((v,i,self)=>v-self.min() ).normalize(1);
  return data.multiply(env);
}
Array.prototype.periodec = function(n) {
  const data = this;
  const p = n % data.length;
  return data[p]
}
Array.prototype.convolution = function(win, kernel, init ) {
  const data = this;
  const result = data.map((v,i,self)=>{
    let chunk;
    if(i+win < self.length){
      chunk = self.slice(i,i+win );
    }else{
      chunk = self.slice(i).concat(create_array(i+win - self.length) );
    }
    if(init == undefined ){
      return chunk.reduce((acc,v,i,self)=>kernel(acc,v,i,self) );
    }else{
      return chunk.reduce((acc,v,i,self)=>kernel(acc,v,i,self),init );
    }
  });
  return result
}
Array.prototype.basement = function() {
  const data = this;
  const ave = data.average();
  return data.map(v=>v-ave);
}
Array.prototype.abs = function(){
  return this.map(v=>Math.abs(v) )
}
Array.prototype.pipe = function(callback) {
  callback(this);
  return this
}
Array.prototype.nsort = function(asc) {
  if(asc){
    return this.sort((a,b)=>a-b<0?-1:1) 
  }else{
    return this.sort((a,b)=>a-b<0?1:-1) 
  }
}
Array.prototype.harmonics = function(f,n,fre_func,gain_func,sampling_rate) {
  if(n==0) return this
  console.log(fre_func(f,n),gain_func(n) );
  return this.sin(fre_func(f,n),gain_func(n) ,sampling_rate).harmonics(f,n-1,fre_func,gain_func)
}
Array.prototype.sum = function() {
  return this.reduce((acc,v)=>v+acc)
}
Array.prototype.random = function() {
  return this.map(v=>Math.random()*2-1 )
}
Array.prototype.shuffle = function() {
  return this.map(v=>[Math.random(),v ] ).sort((a,b)=>a[0]>b[0]?-1:1).map(v=>v[1])
}
