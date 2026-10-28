import Copy from "@/components/Copy";
import { ReactLenis } from "lenis/react";

export default function Home(){
  return (
    <>
      <ReactLenis root />

    <nav>
      <p>Static House</p>
      <p>Menu</p>
    </nav>

    <section className="intro">
      <div className="section-bg">
        <img src="/img_3.jpg"/>
      </div>
      <Copy blockColor="#fe0100">
          <h1>
            Framed in tungsten and shadows, every
            shot holds its own deliberate
            tension.
        </h1>
      </Copy>
      
    </section>

    <section className="about">
      <Copy>
          <p>
          This is cinematography in its raw form
          with practical lamps, soft
          falloff, and the presence of grain that 
          fills each corner of the 
          frame. Every room functions as a set and
          every posture becoms a composition. Light moves across furniture 
          and faces, shaping scenes 
          with a natural sense of depth.
        </p>
      </Copy>
      
    </section>

    <section className="banner-img">
      <div className="section-bg">
          <img src="/img_1.jpg" alt=""/>
      </div>
    </section>

    <section className="services">
      <Copy blockColor ="#fe0100">
        <h1>
        Still frames with bold contrast and 
        lighting choices that embrace
        imperfection.
      </h1>
      </Copy>
      
    </section>

    <section className="banner-img">
      <div className="section-bg">
          <img src="/img_4.jpg" alt=""/>
      </div>
    </section>

    <section className="cta">
      <Copy>
        <p>
        the camera settles into long takes and 
        patient movement. Colors stay unrefined 
        and shadows turn into texture. The image 
        waits for action instead of chasing it.
        Every frame forms a clear visual language 
        built through restraint.
      </p>
      </Copy>
      
    </section>

    <section className="outro">
      <div className="section-bg">
        <img src="/img_2.jpg" alt=""/>
      </div>
      <Copy blockColor="#fe0100">
        <h1>
        Cinematography thrives in the details
        from the grain to the falloff to the
        grow.
      </h1>
      </Copy>
      
    </section>
  </>
  );
}