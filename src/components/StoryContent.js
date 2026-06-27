"use client";
import React, { useState } from 'react';
import Image from 'next/image';

export default function StoryContent() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{ 
      maxWidth: "900px", 
      margin: "0 auto 4rem auto", 
      padding: "4rem 10%", 
      color: "#334155", 
      lineHeight: "2", 
      fontSize: "1.15rem",
      position: "relative",
      backgroundColor: "white",
      borderRadius: "24px",
      boxShadow: "0 20px 40px -10px rgba(0,0,0,0.05)",
      border: "1px solid rgba(0,0,0,0.04)"
    }}>
      <div style={{
        maxHeight: isExpanded ? "none" : "600px",
        overflow: "hidden",
        position: "relative",
        transition: "max-height 0.5s ease"
      }}>

      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h2 style={{ fontSize: "2.5rem", color: "var(--primary)", fontWeight: "800", letterSpacing: "-0.02em" }}>Chapter 1: The Genesis of That Laundry Shop</h2>
        <div style={{ width: "60px", height: "4px", backgroundColor: "var(--accent)", margin: "1.5rem auto 0 auto", borderRadius: "2px" }}></div>
      </div>
      <p style={{ marginBottom: "2rem" }}>
        <span style={{ 
          float: "left", 
          fontSize: "4.5rem", 
          lineHeight: "0.8", 
          fontWeight: "800", 
          color: "var(--primary)", 
          marginRight: "0.75rem", 
          marginTop: "0.5rem" 
        }}>I</span>n the bustling, vibrant heart of Bangkok, where the rhythm of the city never ceases and the demands of modern life press constantly upon its denizens, a silent revolution in garment care was conceived. That Laundry Shop was not merely born out of a desire to clean clothes; it emerged from a profound, driving realization that our most cherished garments—the ones we wear to interviews that change our lives, the dresses we don for unforgettable anniversaries, and the bespoke suits that give us armor in the boardroom—deserve a level of care that standard industrial washing simply cannot provide. The inception of That Laundry Shop was fueled by a passion for fabric, a deep-seated respect for craftsmanship, and an unwavering commitment to excellence. We looked around the landscape of garment care and saw a pervasive commoditization. Clothes were being treated in bulk, tossed into massive vats, subjected to harsh chemicals, and returned to their owners diminished, both in lifespan and in spirit. We knew there had to be a better way. We envisioned a sanctuary for garments, a place where fabric is treated not as a disposable commodity, but as a woven tapestry of personal history and identity. This vision led to the foundation of That Laundry Shop, a premium institution dedicated to the preservation, restoration, and beautification of every thread that crosses our threshold. From our very first day of operation, our mission has been clear: to elevate the mundane task of doing laundry into an artisanal experience, blending the meticulous attention of a master tailor with the precise science of modern textile care. This journey began with a single shop, but our philosophy quickly resonated with a discerning clientele who recognized the profound difference that true care makes. 
      </p>
      <p style={{ marginBottom: "1.5rem" }}>
        The early days were defined by rigorous research and development. We didn't just want to buy washing machines; we wanted to understand the molecular interaction between water, solvent, detergent, and fiber. We consulted with textile engineers, fashion designers, and heritage tailors to build a comprehensive matrix of fabric knowledge. We learned how different weaves respond to tension, how natural dyes react to varying pH levels, and how the structural integrity of a garment can be compromised by a fraction of a degree of excess heat. This obsessive attention to detail became the cornerstone of That Laundry Shop's operational ethos. Every piece of clothing handed to us is first subjected to a meticulous inspection process, akin to a triage in a hospital, where its fabric composition, stain profile, and structural weaknesses are analyzed. Only then is a bespoke cleaning protocol designed specifically for that individual item. This is the genesis of our process: treating each garment as a unique patient requiring a unique prescription. As word of our uncompromising quality spread, we grew from a boutique operation into Bangkok's premier destination for luxury garment care, but our core philosophy has remained completely unchanged. We are still, at our heart, a group of fabric enthusiasts dedicated to the art of the perfect clean.
      </p>

      <h2 style={{ fontSize: "2rem", color: "var(--primary)", marginTop: "3rem", marginBottom: "1.5rem" }}>Chapter 2: The Art and Science of Fabric Care</h2>
      <p style={{ marginBottom: "1.5rem" }}>
        At That Laundry Shop, we firmly believe that true garment care exists at the precise intersection of art and science. The "science" dictates the chemistry of our solvents, the programming of our machines, and the thermodynamics of our pressing equipment. The "art" relies on the intuitive touch, the experienced eye, and the practiced hand of our master cleaners. To understand our approach is to understand that no two fabrics are exactly alike. A cashmere sweater from the highlands of Scotland requires an entirely different ecosystem of care than a raw silk blouse woven in the villages of Thailand. Our scientific approach begins with water quality. In a bustling metropolis like Bangkok, water hardness can fluctuate, and hard water is the enemy of fabric longevity. Therefore, we utilize advanced multi-stage reverse osmosis filtration systems to ensure that the water used in our wet cleaning processes is impeccably pure. This ultra-pure water acts as a gentle, universal solvent, allowing us to use significantly milder, eco-friendly detergents while achieving a superior clean. It prevents the deposit of microscopic mineral crystals within the fibers, which is the primary cause of clothes feeling stiff and looking dull over time.
      </p>
      <p style={{ marginBottom: "1.5rem" }}>
        Beyond water, our mastery of dry cleaning solvents represents the pinnacle of our scientific endeavor. Traditional dry cleaning has long relied on harsh, petroleum-based chemicals that, while effective at removing grease, strip garments of their natural oils and leave behind a distinct, unpleasant chemical odor. That Laundry Shop has completely revolutionized this paradigm by adopting state-of-the-art alternative solvents that are not only profoundly effective but also incredibly gentle. Our solvents interact with stains at a molecular level, dissolving them without swelling or agitating the delicate fibers of the garment. This means your structured wool suits maintain their crisp drape, your delicate synthetics resist pilling, and your vintage pieces are preserved for future generations. But science alone is insufficient without art. The artistry comes into play during the stain removal process, also known as "spotting." Our spotting experts are veritable chemists and artists combined. Armed with an array of specialized, targeted treatments, they approach each stain with a tactical mindset. A red wine stain on silk requires a different enzymatic approach than an oil stain on linen. Our artisans know exactly how to manipulate heat, steam, and mechanical action to lift the most stubborn blemishes without causing even microscopic damage to the surrounding weave. This meticulous, hand-finished approach is what elevates That Laundry Shop from a mere service provider to true artisans of fabric.
      </p>

      <h2 style={{ fontSize: "2rem", color: "var(--primary)", marginTop: "3rem", marginBottom: "1.5rem" }}>Chapter 3: State-of-the-Art Technology Meets Artisanal Craftsmanship</h2>
      <p style={{ marginBottom: "1.5rem" }}>
        The backbone of our operation lies in our uncompromising investment in the world's most advanced garment care technology. We have scoured the globe, importing heavy-duty, precision-engineered machinery primarily from Germany and Italy—countries universally recognized as the gold standard in textile care engineering. These machines are not just washing machines; they are highly calibrated, computerized fabric care ecosystems. Our wet cleaning machines, for instance, are equipped with variable frequency drives that allow the drum to rotate with a gentleness that mimics the delicate swish of hand-washing. They precisely control the water temperature to within a fraction of a degree, ensuring that proteins in stains do not coagulate and set into the fabric. The drum designs feature specialized perforations that create a cushion of water, preventing the garments from ever scraping against the metal during the extraction phase.
      </p>
      <p style={{ marginBottom: "1.5rem" }}>
        However, technology, no matter how advanced, is completely blind without human expertise to guide it. This is where our artisanal craftsmanship truly shines. The synergy between our European technology and our highly trained staff is the secret to our unparalleled results. After a garment has been scientifically cleaned, it enters the finishing phase. This is arguably the most critical step in garment restoration. We do not use brutal, automated pressing machines that flatten fibers and leave shiny, unnatural creases on lapels and seams. Instead, we utilize specialized tensioning equipment and European steam boards. Our master pressers use hand-irons equipped with Teflon shoes to gently steam and shape each garment back to its original architectural design. A suit jacket is not just flattened; it is rolled, shaped, and coaxed over specially designed forms to restore the natural curve of the shoulder and the soft roll of the lapel. This level of hand-finishing requires years of apprenticeship and a profound understanding of garment construction. Our staff are trained to look inside the garment, to understand the role of the canvas, the lining, and the stitching, ensuring that the outside looks perfect because the inside has been treated with respect. At That Laundry Shop, technology provides the power, but our artisans provide the soul.
      </p>

      <h2 style={{ fontSize: "2rem", color: "var(--primary)", marginTop: "3rem", marginBottom: "1.5rem" }}>Chapter 4: The Unwavering Commitment to Sustainability and Eco-Friendly Practices</h2>
      <div style={{ margin: "2.5rem 0", borderRadius: "16px", overflow: "hidden", boxShadow: "0 15px 35px rgba(0,0,0,0.1)" }}>
        <Image src="/assets/story_eco.webp" alt="Pure Eco-Friendly Solvent" width={800} height={500} style={{ width: "100%", height: "auto", display: "block" }} />
      </div>
      <p style={{ marginBottom: "1.5rem" }}>
        In today's world, luxury and premium quality must be inextricably linked with environmental responsibility. At That Laundry Shop, we recognized early on that the traditional laundry and dry cleaning industry is one of the most environmentally taxing sectors, known for excessive water consumption, high energy usage, and the emission of toxic volatile organic compounds (VOCs). We made a fundamental, uncompromising decision that our pursuit of the perfect clean would never come at the expense of our planet. This commitment to sustainability is woven into the very fabric of our operational model. We have entirely eliminated the use of Perchloroethylene (Perc), a toxic, carcinogenic solvent that is still shockingly common in standard dry cleaners. Instead, we utilize premium, biodegradable, and non-toxic liquid silicone and hydrocarbon alternatives. These eco-friendly solvents degrade naturally into sand, water, and trace amounts of carbon dioxide, posing absolutely zero threat to the soil, the groundwater, or the ozone layer. 
      </p>
      <p style={{ marginBottom: "1.5rem" }}>
        Our environmental stewardship extends far beyond our choice of solvents. We have implemented a closed-loop water recycling system in our main processing facility. This state-of-the-art system captures, filters, and purifies the water used in our washing cycles, allowing us to safely reuse up to 70% of our water without compromising cleaning efficacy. This drastically reduces our draw on Bangkok's municipal water supply. Furthermore, our European machinery is designed for maximum thermal efficiency. We capture the ambient heat generated by our steam boilers and pressing equipment and redirect it to pre-heat our incoming water supply, dramatically reducing the amount of natural gas and electricity required to run our operations. Even our packaging reflects our eco-conscious ethos. We have transitioned away from single-use plastics, utilizing biodegradable garment bags, recycled paper for our shirt bands, and reusable premium fabric bags for our subscription clients. We believe that true premium service means taking care of the garment, the client, and the environment simultaneously. When you entrust your wardrobe to That Laundry Shop, you are not just making a choice for superior garment care; you are making a conscious, responsible choice for a more sustainable future.
      </p>

      <h2 style={{ fontSize: "2rem", color: "var(--primary)", marginTop: "3rem", marginBottom: "1.5rem" }}>Chapter 5: The White-Glove Experience: Redefining Convenience and Customer Care</h2>
      <div style={{ margin: "2.5rem 0", borderRadius: "16px", overflow: "hidden", boxShadow: "0 15px 35px rgba(0,0,0,0.1)" }}>
        <Image src="/assets/story_delivery.webp" alt="White Glove Concierge Delivery" width={800} height={500} style={{ width: "100%", height: "auto", display: "block" }} />
      </div>
      <p style={{ marginBottom: "1.5rem" }}>
        We understand that our clientele includes some of the busiest, most demanding professionals and expatriates in Thailand. For them, time is the ultimate luxury. Therefore, we designed That Laundry Shop not just as a cleaning facility, but as a comprehensive, white-glove logistics and concierge service. The experience begins the moment you schedule a pickup through our streamlined digital platform. Our dedicated fleet of custom-fitted delivery vehicles, driven by our courteous, uniformed logistics professionals, arrives precisely at your scheduled time. We do not just collect your laundry; our drivers are trained to handle your garments with the utmost respect from the first interaction, placing them carefully into protective transit bags designed to prevent any creasing or damage during transport. 
      </p>
      <p style={{ marginBottom: "1.5rem" }}>
        Our concierge team serves as the vital bridge between our artisans and our clients. We recognize that many garments have specific histories, sentimental value, or unique care requirements that cannot be captured on a standard care label. Our multi-lingual concierge team is available via WhatsApp, email, or phone to discuss your specific needs. Do you have a vintage dress with a fragile lace collar? A bespoke suit that requires a specific type of crease? A shirt with a stubborn, mysterious stain? Our concierge team notes every detail, translating your requests into specific, actionable directives for our cleaning technicians. We provide complete transparency throughout the process. If our experts identify a potential risk during the pre-inspection phase—such as a weak seam or a dye that is likely to bleed—our concierge will contact you before any action is taken to discuss the best course of action. Upon completion, your garments are delivered back to your home, office, or hotel exactly when promised, impeccably clean, crisply pressed, and perfectly packaged, ready to be worn. This seamless, stress-free, deeply personalized customer journey is what we define as the That Laundry Shop White-Glove Experience.
      </p>

      <h2 style={{ fontSize: "2rem", color: "var(--primary)", marginTop: "3rem", marginBottom: "1.5rem" }}>Chapter 6: A Trusted Partner to the Hospitality Industry</h2>
      <div style={{ margin: "2.5rem 0", borderRadius: "16px", overflow: "hidden", boxShadow: "0 15px 35px rgba(0,0,0,0.1)" }}>
        <Image src="/assets/story_hospitality.webp" alt="Luxury Hotel Towels" width={800} height={500} style={{ width: "100%", height: "auto", display: "block" }} />
      </div>
      <p style={{ marginBottom: "1.5rem" }}>
        While our direct-to-consumer service is the public face of That Laundry Shop, our expertise and reliability have made us the trusted, behind-the-scenes partner for some of Thailand's most prestigious luxury hotels, boutique resorts, and high-end serviced apartments. The hospitality industry operates on a standard of absolute perfection; a single stained towel or a poorly pressed uniform can irrevocably tarnish a five-star reputation. These elite institutions entrust their guest laundry, staff uniforms, and delicate linens to us because they know we operate with military precision and artisanal care. 
      </p>
      <p style={{ marginBottom: "1.5rem" }}>
        Servicing the hospitality sector requires an entirely different scale of logistical mastery. We have dedicated account managers who work closely with hotel executive housekeepers to integrate our services seamlessly into their daily operations. We offer expedited turnaround times for VIP guests, emergency stain removal services, and specialized cleaning for highly sensitive materials like theatrical costumes for in-house entertainment or high-value decorative tapestries. Our ability to scale our uncompromising quality to meet the high-volume demands of luxury hotels is a testament to the robust, highly organized infrastructure we have built. When international dignitaries, celebrities, and discerning travelers stay in Bangkok's finest suites, it is often That Laundry Shop that ensures their wardrobes are perfectly maintained behind closed doors. This level of institutional trust validates our methodology and constantly pushes us to elevate our standards even further.
      </p>

      <h2 style={{ fontSize: "2rem", color: "var(--primary)", marginTop: "3rem", marginBottom: "1.5rem" }}>Chapter 7: Cultivating Excellence: The Training of Our Artisans</h2>
      <p style={{ marginBottom: "1.5rem" }}>
        We often say that our machinery is state-of-the-art, but our people are irreplaceable. The true value of That Laundry Shop lies within the minds and hands of our dedicated team. In an industry notoriously plagued by high turnover and unskilled labor, we have taken a radically different approach. We view garment care as a skilled trade, a craft that requires years of study, practice, and dedication. Therefore, we do not simply hire workers; we cultivate artisans. Every member of our technical team undergoes a rigorous, multi-tiered training program that spans months before they are allowed to independently handle client garments. 
      </p>
      <p style={{ marginBottom: "1.5rem" }}>
        Our curriculum covers the entire spectrum of textile science. Our trainees learn to identify microscopic fiber types under magnification, understand the chemical pH balance required for different stain removals, and master the complex thermodynamics of our European pressing equipment. We frequently bring in international experts, master tailors, and textile engineers to conduct specialized workshops, ensuring our team remains at the absolute cutting edge of global garment care advancements. But training is not just about technical skills; it is about cultivating a specific mindset. We instill in our team a profound respect for the garments they handle, teaching them that they are the temporary custodians of someone else's prized possessions. We reward meticulousness, patience, and a relentless pursuit of perfection. This culture of excellence means that our staff take immense personal pride in their work. When a technician successfully removes a seemingly impossible stain, or when a presser perfectly sculpts the lapel of a tuxedo, it is a moment of professional triumph. This deep-seated passion and expertise are woven into every single garment we deliver.
      </p>

      <h2 style={{ fontSize: "2rem", color: "var(--primary)", marginTop: "3rem", marginBottom: "1.5rem" }}>Chapter 8: Looking to the Future of Fabric Care</h2>
      <p style={{ marginBottom: "1.5rem" }}>
        As we look toward the future, That Laundry Shop remains steadfast in its commitment to continuous innovation. The world of fashion and textiles is constantly evolving. We are seeing the rise of complex, blended synthetics, smart fabrics integrated with wearable technology, and a global movement toward sustainable, organic materials. Each of these innovations presents a new challenge for the garment care industry, and we are determined to remain at the forefront of solving them. We are currently researching the integration of ozone technology and advanced UV-C sterilization techniques into our standard cleaning protocols to provide an even deeper, microscopic level of hygiene without the use of harsh chemicals.
      </p>
      <p style={{ marginBottom: "1.5rem" }}>
        Furthermore, we are heavily investing in digital integration to make our white-glove service even more frictionless for our clients. We envision a future where clients can track the exact status of their garments through our proprietary app, receiving real-time updates from the moment of pickup to the final inspection. We are exploring the use of AI to analyze stain imagery and suggest optimal, highly-specific chemical treatments to our technicians, further reducing the margin for human error. Yet, regardless of how advanced our technology becomes, our core philosophy will never waiver. That Laundry Shop will always be defined by the human touch—the careful inspection, the intuitive treatment, and the masterful finishing. We are not just cleaning clothes; we are preserving memories, protecting investments, and ensuring that our clients always step out into the world looking and feeling their absolute best. This is our story. This is our promise. This is That Laundry Shop.
      </p>
      </div>

      {!isExpanded && (
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "300px",
          background: "linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1) 85%)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          paddingBottom: "3rem",
          borderRadius: "0 0 24px 24px"
        }}>
          <button 
            onClick={() => setIsExpanded(true)}
            style={{
              padding: "1rem 2.5rem",
              fontSize: "1.1rem",
              fontWeight: "600",
              backgroundColor: "var(--primary)",
              color: "white",
              border: "none",
              borderRadius: "var(--radius)",
              cursor: "pointer",
              boxShadow: "0 10px 25px rgba(26, 54, 93, 0.2)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 15px 30px rgba(26, 54, 93, 0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 25px rgba(26, 54, 93, 0.2)";
            }}
          >
            Read Our Full Story <i className="fa-solid fa-chevron-down" style={{ marginLeft: "8px" }}></i>
          </button>
        </div>
      )}
      
      {isExpanded && (
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <button 
            onClick={() => setIsExpanded(false)}
            style={{
              padding: "0.8rem 2rem",
              fontSize: "1rem",
              fontWeight: "600",
              backgroundColor: "transparent",
              color: "var(--primary)",
              border: "2px solid var(--primary)",
              borderRadius: "var(--radius)",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(26, 54, 93, 0.05)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Show Less <i className="fa-solid fa-chevron-up" style={{ marginLeft: "8px" }}></i>
          </button>
        </div>
      )}
    </div>
  );
}
