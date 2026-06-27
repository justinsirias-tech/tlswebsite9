"use client";
import React, { useState } from 'react';
import Image from 'next/image';

export default function StoryContentCn() {
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
        <h2 style={{ fontSize: "2.5rem", color: "var(--primary)", fontWeight: "800", letterSpacing: "-0.02em" }}>第一章：That Laundry Shop 的创立</h2>
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
        }}>在</span>繁华活力的曼谷市中心，城市节奏永不停歇，现代生活的重压不断降临其居民。正是在这里，一场衣物护理的静默变革悄然萌芽。That Laundry Shop 的诞生，不仅仅源于清洁衣物的简单愿望；它更是一种深刻而强烈的体悟——我们最珍视的衣物，那些我们穿着去改变人生的面试、盛装出席难忘周年庆典的礼服，以及让我们在董事会议室中如披战甲的定制西装，都值得拥有传统工业洗衣无法企及的精致护理。That Laundry Shop 创立的动力源于对织物的热爱、对精湛工艺的由衷敬意以及对卓越品质的坚定不移的追求。我们审视了当时的衣物护理行业，发现普遍存在的商品化现象。衣物被批量处理、投入大型洗涤槽、接触刺激性化学品，最终返回顾客手中时，无论是使用寿命还是原有风貌都大打折扣。我们深知，必须有更好的方式。我们构想了一个衣物的殿堂，一个将织物视为个人历史与身份交织的华美织锦，而非随意消耗的商品之地。这一愿景促成了 That Laundry Shop 的建立，一家致力于保护、修复和美化每一寸经由我们之手的织物的优质机构。从运营的第一天起，我们的使命就清晰明确：将日常的洗衣任务升华为一种匠心独运的艺术体验，融合裁缝大师的精湛细致与现代纺织护理的严谨科学。这段旅程始于一家小店，但我们的理念迅速获得了独具慧眼的客户群体的共鸣，他们深知真正专业的护理所带来的巨大差异。
      </p>
      <p style={{ marginBottom: "1.5rem" }}>
        早期阶段以严谨的研发为核心。我们不满足于仅仅购买洗衣机；我们渴望理解水、溶剂、洗涤剂和纤维之间的分子相互作用。我们咨询了纺织工程师、时装设计师和传统裁缝，构建了一个全面的织物知识体系。我们学习了不同织法对张力的反应，天然染料如何应对不同的pH值，以及哪怕是细微的过热都可能损害衣物的结构完整性。这种对细节的极致关注成为了 That Laundry Shop 运营理念的基石。每一件送到我们手中的衣物，首先都会经历一个细致入微的检查流程，如同医院里的分诊，对其织物成分、污渍类型和结构弱点进行全面分析。只有在此之后，才会针对该件衣物量身定制一套清洁方案。这就是我们流程的诞生：将每件衣物视为独特的“病患”，需要独特的“处方”。随着我们不妥协的品质声誉传开，我们从一家精品店发展成为曼谷奢华衣物护理的首选目的地，但我们的核心理念始终如一。我们本质上仍是一群致力于完美清洁艺术的织物爱好者。
      </p>

      <h2 style={{ fontSize: "2rem", color: "var(--primary)", marginTop: "3rem", marginBottom: "1.5rem" }}>第二章：织物护理的艺术与科学</h2>
      <p style={{ marginBottom: "1.5rem" }}>
        在 That Laundry Shop，我们坚信真正的衣物护理存在于艺术与科学的精准交汇处。“科学”决定了我们溶剂的化学成分、机器的编程以及熨烫设备的热力学原理。“艺术”则依赖于我们清洁大师的直觉触感、经验丰富的目光和娴熟的巧手。要理解我们的方法，就必须认识到没有两种织物是完全相同的。一件来自苏格兰高地的羊绒衫，与一件在泰国乡村编织的生丝衬衫，需要完全不同的护理生态系统。我们的科学方法始于水质。在曼谷这样的繁华大都市，水的硬度会波动，而硬水是织物寿命的“敌人”。因此，我们采用先进的多级反渗透过滤系统，确保我们湿洗过程中使用的水纯净无瑕。这种超纯水作为一种温和的通用溶剂，使我们能够使用显著温和的环保洗涤剂，同时达到卓越的清洁效果。它能防止微观矿物晶体在纤维内部沉积，这些晶体是衣物随着时间推移变得僵硬和暗淡的主要原因。
      </p>
      <p style={{ marginBottom: "1.5rem" }}>
        除了水，我们对干洗溶剂的精通代表着我们科学探索的巅峰。传统干洗长期以来一直依赖于刺激性的石油基化学品，这些化学品虽然能有效去除油污，但会剥夺衣物天然的油脂，并留下独特、令人不悦的化学气味。That Laundry Shop 通过采用最先进的替代溶剂，彻底革新了这一范式，这些溶剂不仅效果显著，而且异常温和。我们的溶剂在分子层面与污渍相互作用，在不使衣物娇嫩纤维膨胀或搅动的情况下将其溶解。这意味着您的结构化羊毛西装能保持其挺括悬垂，您的精致合成纤维抗起球，您的复古珍品得以世代相传。然而，没有艺术，仅有科学是不足的。艺术性体现在污渍去除过程，亦称“局部去渍”。我们的去渍专家是真正的化学家与艺术家合二为一。他们手持一系列专业、有针对性的处理方法，以策略性思维对待每一个污渍。丝绸上的红酒渍需要与亚麻布上的油渍不同的酶处理方法。我们的匠人精确操控热量、蒸汽和机械作用，去除最顽固的污渍，而不会对周围的织物结构造成哪怕是微观的损害。正是这种细致入微、手工完成的方法，将 That Laundry Shop 从一个简单的服务提供商提升为真正的织物艺术大师。
      </p>

      <h2 style={{ fontSize: "2rem", color: "var(--primary)", marginTop: "3rem", marginBottom: "1.5rem" }}>第三章：尖端科技与匠心工艺的融合</h2>
      <p style={{ marginBottom: "1.5rem" }}>
        我们运营的基石在于我们对全球最先进衣物护理科技的坚定投入。我们足迹遍布全球，主要从德国和意大利进口重型、精密工程机械——这两个国家被公认为纺织护理工程领域的黄金标准。这些机器不仅仅是洗衣机；它们是高度校准、电脑化的织物护理生态系统。例如，我们的湿洗机配备变频驱动器，使滚筒能够以模仿手洗轻柔摆动的方式旋转。它们将水温精确控制在小数点后几位的范围，确保污渍中的蛋白质不会凝固并固着在织物中。鼓筒设计具有特殊穿孔，形成水垫，防止衣物在脱水阶段刮擦金属。
      </p>
      <p style={{ marginBottom: "1.5rem" }}>
        然而，科技无论多么先进，若没有人类专业知识的引导，便如同盲人摸象。这正是我们的匠心工艺才真正大放异彩之处。欧洲技术与我们训练有素的员工之间的协同作用，是我们取得无与伦比成果的秘诀。衣物经过科学清洁后，便进入了收尾阶段。这可以说是衣物修复过程中最关键的一步。我们不使用粗暴的自动化熨烫机，它们会压平纤维，并在翻领和缝线上留下闪亮、不自然的褶痕。相反，我们利用专业的张力设备和欧洲蒸汽熨烫板。我们的熨烫大师使用配备特氟龙底板的手持熨斗，轻柔地蒸汽塑形，将每件衣物恢复到其原有的结构设计。一件西装外套不仅仅是被压平；它会被卷起、塑形，并在专门设计的模具上进行精细调整，以恢复肩部的自然弧度以及翻领的柔和卷曲。这种程度的手工收尾需要多年的学徒生涯以及对服装结构的深刻理解。我们的员工都经过培训，懂得审视衣物内部，理解衬布、内衬和缝线的各自作用，确保外部看起来完美无瑕，是因为内部也得到了应有的尊重。在 That Laundry Shop，科技赋予力量，而我们的匠人则赋予灵魂。
      </p>

      <h2 style={{ fontSize: "2rem", color: "var(--primary)", marginTop: "3rem", marginBottom: "1.5rem" }}>第四章：对可持续发展和环保实践的坚定承诺</h2>
      <div style={{ margin: "2.5rem 0", borderRadius: "16px", overflow: "hidden", boxShadow: "0 15px 35px rgba(0,0,0,0.1)" }}>
        <Image src="/assets/story_eco.webp" alt="纯净环保溶剂" width={800} height={500} style={{ width: "100%", height: "auto", display: "block" }} />
      </div>
      <p style={{ marginBottom: "1.5rem" }}>
        在当今世界，奢华与卓越品质必须与环境责任密不可分。That Laundry Shop 早在初期便认识到，传统的洗衣和干洗行业是环境负担最重的行业之一，以其过度的水消耗、高能耗以及有毒挥发性有机化合物 (VOCs) 的排放而闻名。我们做出了一项根本性、不妥协的决定：对完美清洁的追求绝不会以牺牲地球为代价。这种对可持续发展的承诺已融入我们运营模式的方方面面。我们已完全淘汰了全氯乙烯（Perc）的使用，这是一种有毒、致癌的溶剂，在普通干洗店中仍普遍使用，令人震惊。相反，我们利用高级、可生物降解且无毒的液态硅酮和碳氢化合物替代品。这些环保溶剂自然降解为沙子、水和微量二氧化碳，对土壤、地下水或臭氧层不构成任何威胁。
      </p>
      <p style={{ marginBottom: "1.5rem" }}>
        我们的环境管理职责远不止于溶剂选择。我们在主要处理设施中实施了闭环水循环系统。这一尖端系统捕获、过滤并净化我们洗涤周期中使用的水，使我们能够安全地重复使用高达70%的水，而不影响清洁效果。这大幅减少了我们对曼谷市政供水的依赖。此外，我们的欧洲机械旨在实现最大热效率。我们捕获蒸汽锅炉和熨烫设备产生的环境热量，并将其重新定向用于预热水供应，显著减少运营所需的天然气和电力消耗。甚至我们的包装也体现了我们的环保理念。我们已逐步淘汰一次性塑料，转而使用可生物降解的衣物袋、用于衬衫包装的再生纸带，以及为订阅客户提供的可重复使用的高级布袋。我们相信，真正的优质服务意味着同时关爱衣物、客户和环境。当您将您的衣橱托付给 That Laundry Shop，您不仅是选择卓越的衣物护理服务；您更是为更可持续的未来做出了有意识、负责任的选择。
      </p>

      <h2 style={{ fontSize: "2rem", color: "var(--primary)", marginTop: "3rem", marginBottom: "1.5rem" }}>第五章：白手套体验：重新定义便捷与客户关怀</h2>
      <div style={{ margin: "2.5rem 0", borderRadius: "16px", overflow: "hidden", boxShadow: "0 15px 35px rgba(0,0,0,0.1)" }}>
        <Image src="/assets/story_delivery.webp" alt="白手套礼宾送达服务" width={800} height={500} style={{ width: "100%", height: "auto", display: "block" }} />
      </div>
      <p style={{ marginBottom: "1.5rem" }}>
        我们深知，我们的客户群体包括泰国最繁忙、要求最高的专业人士和外籍人士。对他们而言，时间是极致的奢华。因此，我们将 That Laundry Shop 不仅设计为一个清洁设施，更是一个全面、白手套式的物流和礼宾服务。您的体验从通过我们流畅的数字平台预约取件的那一刻开始。我们的专业车队，配备定制配送车辆，由我们礼貌且穿着制服的物流专家驾驶，准时抵达您预定的时间。我们不只是收集您的衣物；我们的司机都经过培训，从第一次互动开始就以最崇高的敬意对待您的衣物，将它们小心翼翼地放入专用运输袋中，以防止在运输过程中产生任何褶皱或损坏。
      </p>
      <p style={{ marginBottom: "1.5rem" }}>
        我们的礼宾团队是连接我们的匠人与客户之间的重要桥梁。我们认识到，许多衣物拥有特殊历史、情感价值或标准洗涤标签无法体现的独特护理要求。我们的多语言礼宾团队可通过 WhatsApp、电子邮件或电话为您提供服务，讨论您的具体需求。您是否有一件领口有脆弱蕾丝的复古连衣裙？一套需要特定熨烫折痕的定制西装？一件带有顽固、神秘污渍的衬衫？我们的礼宾团队记录每一个细节，将您的请求转化为对我们清洁技师的具体、可执行的指示。我们提供整个过程完全透明。如果我们的专家在预检阶段发现潜在风险——例如脆弱的缝线或可能褪色的染料——我们的礼宾人员会在采取任何措施之前与您联系，讨论最佳处理方案。完成后，您的衣物将准时送回您的家中、办公室或酒店，洁净无瑕、熨烫平整、包装完美，随时可穿。这种无缝、无忧、高度个性化的客户体验，就是我们定义的 That Laundry Shop 白手套体验。
      </p>

      <h2 style={{ fontSize: "2rem", color: "var(--primary)", marginTop: "3rem", marginBottom: "1.5rem" }}>第六章：酒店业的信赖伙伴</h2>
      <div style={{ margin: "2.5rem 0", borderRadius: "16px", overflow: "hidden", boxShadow: "0 15px 35px rgba(0,0,0,0.1)" }}>
        <Image src="/assets/story_hospitality.webp" alt="豪华酒店毛巾" width={800} height={500} style={{ width: "100%", height: "auto", display: "block" }} />
      </div>
      <p style={{ marginBottom: "1.5rem" }}>
        尽管我们面向消费者的服务是 That Laundry Shop 的公众形象，但我们的专业知识和可靠性使我们成为泰国一些最负盛名的豪华酒店、精品度假村和高端服务式公寓值得信赖的幕后合作伙伴。酒店业以绝对完美的标准运营；一条有污渍的毛巾或一件熨烫不佳的制服都可能无可挽回地损害五星级声誉。这些精英机构将他们的客用洗衣、员工制服和精致布草委托给我们，因为他们深知我们以军事般的精确和匠心独运的护理标准运作。
      </p>
      <p style={{ marginBottom: "1.5rem" }}>
        为酒店行业提供服务需要完全不同规模的物流管理能力。我们拥有专门的客户经理，与酒店行政管家密切合作，将我们的服务无缝融入其日常运营中。我们为VIP客人提供加急周转时间，提供紧急污渍去除服务，并为高度敏感的材料提供专业清洁，例如内部娱乐的剧院服装或高价值的装饰挂毯。我们能够将我们不妥协的品质扩展，以满足豪华酒店的大批量需求，这证明了我们所建立的强大、高度组织化的基础设施。当国际政要、名流和独具慧眼的旅客下榻曼谷最豪华的套房时，通常是 That Laundry Shop 在幕后确保他们的衣物得到完美维护。这种机构信任水平验证了我们的方法论，并不断推动我们进一步提升标准。
      </p>

      <h2 style={{ fontSize: "2rem", color: "var(--primary)", marginTop: "3rem", marginBottom: "1.5rem" }}>第七章：精益求精：匠人培养之道</h2>
      <p style={{ marginBottom: "1.5rem" }}>
        我们常说，我们的机器设备是尖端的，但我们的人才是不可替代的。That Laundry Shop 的真正价值在于我们专业团队的思想和双手。在一个以高人员流动率和非熟练劳动力而臭名昭著的行业中，我们采取了截然不同的方法。我们将衣物护理视为一门需要多年学习、实践和奉献的技艺。因此，我们不只是雇佣工人；我们培养匠人。我们技术团队的每一位成员都将经历一个严谨的多层次培训计划，为期数月，之后才允许他们独立处理客户衣物。
      </p>
      <p style={{ marginBottom: "1.5rem" }}>
        我们的课程涵盖了纺织科学的全部范围。我们的学员学习在显微镜下识别微观纤维类型，理解不同污渍去除所需的化学pH平衡，并掌握我们欧洲熨烫设备复杂的传热学原理。我们经常邀请国际专家、裁缝大师和纺织工程师前来举办专业研讨会，确保我们的团队始终站在全球衣物护理进步的绝对前沿。然而，培训不仅仅是关于技术技能；它更是关于培养一种特定的思维模式。我们向我们的团队灌输对他们所处理衣物的深刻尊重，教导他们是他人珍贵财产的暂时保管者。我们奖励一丝不苟、耐心细致以及对完美的不懈追求。这种卓越文化意味着我们的员工对自己的工作怀有巨大的自豪感。当技师成功去除一个看似不可能的污渍，或者熨烫师完美塑形燕尾服的翻领时，那是一个职业上的胜利时刻。这种根深蒂固的热情和专业知识融入了我们交付的每一件衣物之中。
      </p>

      <h2 style={{ fontSize: "2rem", color: "var(--primary)", marginTop: "3rem", marginBottom: "1.5rem" }}>第八章：展望织物护理的未来</h2>
      <p style={{ marginBottom: "1.5rem" }}>
        展望未来，That Laundry Shop 始终坚定不移地致力于持续创新。时尚和纺织品的世界正在不断演变。我们看到复杂混纺合成纤维、集成可穿戴技术的智能面料以及全球向可持续有机材料发展的趋势正在兴起。这些创新中的每一项都为衣物护理行业带来了新的挑战，我们决心站在解决这些问题的前沿。我们目前正在研究将臭氧技术和先进的UV-C灭菌技术整合到我们的标准清洁方案中，以在不使用刺激性化学品的情况下提供更深层、微观的卫生级别。
      </p>
      <p style={{ marginBottom: "1.5rem" }}>
        此外，我们正在大力投资数字化整合，以使我们的白手套服务对客户而言更加流畅无阻。我们设想一个未来，客户可以通过我们的专属应用程序跟踪其衣物的确切状态，从取件到最终检查，实时接收更新。我们正在探索使用人工智能分析污渍图像，并向我们的技师建议最佳、高度特定的化学处理方案，从而进一步减少人为错误的几率。然而，无论我们的技术变得多么先进，我们的核心理念将永不改变。That Laundry Shop 将始终以人性化的触感为标志——细致的检查、直观的处理和精湛的收尾。我们不仅是清洁衣物；我们更在保存记忆、保护投资，并确保我们的客户始终以最佳形象和感受示人。这是我们的故事。这是我们的承诺。这就是 That Laundry Shop。
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
            阅读完整故事 <i className="fa-solid fa-chevron-down" style={{ marginLeft: "8px" }}></i>
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
            收起 <i className="fa-solid fa-chevron-up" style={{ marginLeft: "8px" }}></i>
          </button>
        </div>
      )}
    </div>
  );
}