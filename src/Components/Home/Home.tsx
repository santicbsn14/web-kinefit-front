import * as React from 'react'
import ruso from '../Imagenes/ruso.png'
import joaquin from '../Imagenes/joaquin.png'
import frenteKinefit from '../Imagenes/frenteKinefit.png'
import InstagramWidget from '../../InstagramFeed'
const Home = () :JSX.Element =>{
    return (
    <div>
        <h1 style={{marginTop:'10px', color:'#978f7f'}}> Bienvenidos a kinefit!</h1>
        <div className="imagenes-home" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
            <img src={ruso} alt="" style={{width:'300px', height:'300px', padding:'10px'}} />
            <img src={frenteKinefit} alt="" style={{width:'300px', height:'300px', padding:'10px'}} />
            <img src={joaquin} alt="" style={{width:'300px', height:'300px', padding:'10px'}} />
        </div>
        <p style={{color:'#978f7f'}}>Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum nihil, inventore saepe praesentium repellendus possimus quo quod deleniti, error amet minima eligendi voluptatibus eaque dolor quidem vitae, ullam aspernatur quis.</p>
        <InstagramWidget></InstagramWidget>
    </div>
    )
}
export default Home