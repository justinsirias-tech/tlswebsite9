module.exports=[49593,a=>{"use strict";var b=a.i(87924),c=a.i(72131),d=a.i(87552);a.s(["default",0,function(){let a=a=>{if(!a)return"";let b=new Date(a);if(isNaN(b.getTime()))return"";let c=String(b.getDate()).padStart(2,"0"),d=String(b.getMonth()+1).padStart(2,"0"),e=b.getFullYear(),f=String(b.getHours()).padStart(2,"0"),g=String(b.getMinutes()).padStart(2,"0");return`${c}/${d}/${e} ${f}:${g}`},[e,f]=(0,c.useState)([]),[g,h]=(0,c.useState)(!0),[i,j]=(0,c.useState)(""),[k,l]=(0,c.useState)("ALL"),[m,n]=(0,c.useState)([]);(0,c.useEffect)(()=>{o(),p()},[]);let o=async()=>{try{let a=await fetch("/api/bookings"),b=await a.json();f(b)}catch(a){console.error("Failed to fetch bookings:",a)}finally{h(!1)}},p=async()=>{try{let a=await fetch("/api/admin/users");if(a.ok){let b=await a.json();n(b)}}catch(a){console.error("Failed to fetch admin users:",a)}},q=async(a,b)=>{if(confirm(`Are you sure you want to change this booking status to ${b}?`))try{(await fetch("/api/bookings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:a,status:b})})).ok?f(c=>c.map(c=>c.id===a?{...c,status:b}:c)):alert("Failed to update booking status.")}catch(a){console.error(a),alert("Error updating status.")}},r=a=>{let b={services:"",address:"",delivery:"",pickupMethod:"",time:"",paymentMethod:"",expressService:"",notes:"",roomNo:"",deliveryRoomNo:""};return a&&(a.split("\n").forEach(a=>{let c=a.trim();if(c.startsWith("Services:"))b.services=c.replace("Services:","").trim();else if(c.startsWith("Address:")){let a=c.replace("Address:","").trim(),d=a.match(/Room\s+([^,]+)/i);d?(b.roomNo=d[1].trim(),b.address=a.replace(/,?\s*Room\s+[^,]+,?/i,"").trim()):b.address=a}else if(c.startsWith("Delivery:")){let a=c.replace("Delivery:","").trim(),d=a.match(/Room\s+([^,]+)/i);d?(b.deliveryRoomNo=d[1].trim(),b.delivery=a.replace(/,?\s*Room\s+[^,]+,?/i,"").trim()):b.delivery=a}else c.startsWith("Pickup Method:")?b.pickupMethod=c.replace("Pickup Method:","").trim():c.startsWith("Time:")?b.time=c.replace("Time:","").trim():c.startsWith("Payment Method:")?b.paymentMethod=c.replace("Payment Method:","").trim():c.startsWith("Express Service:")?b.expressService=c.replace("Express Service:","").trim():c.startsWith("Notes:")&&(b.notes=c.replace("Notes:","").trim())}),!b.services&&a&&(a.includes("Services:")?b.services="None selected":b.services=a)),b},s=a=>{if(!a)return[];if(a.includes(";"))return a.split(";").map(a=>a.trim()).filter(Boolean);let b=new Set,c=a.toLowerCase().replace(/\s*\/\s*/g,"/").replace(/\s*&\s*/g,"&");return([{canonical:"Wash & Fold (Weight)",patterns:["wash & fold","wash and fold","wash & fold (weight)","wash/fold"]},{canonical:"Wash, Iron & Fold (Weight)",patterns:["wash, iron & fold","wash, iron and fold","wash/iron/fold","wash, iron & fold (weight)","wash/iron/fold (weight)"]},{canonical:"Wash, Iron & Hang (Weight)",patterns:["wash, iron & hang","wash, iron and hang","wash/iron/hang","wash, iron & hang (weight)","wash/iron/hang (weight)"]},{canonical:"Dry cleaning",patterns:["dry cleaning","dry clean","dry-cleaning"]},{canonical:"Linens & Beddings",patterns:["linens & beddings","linens and beddings","linens/beddings","linens","beddings","bedding"]},{canonical:"Mixed Service",patterns:["mixed service","mixed"]},{canonical:"Ironing & Pressing only",patterns:["ironing & pressing only","ironing & pressing","ironing and pressing","ironing only","pressing only"]},{canonical:"Others",patterns:["others","other"]}].forEach(a=>{for(let d of a.patterns){let e=d.toLowerCase().replace(/\s*\/\s*/g,"/").replace(/\s*&\s*/g,"&");if(c.includes(e)){b.add(a.canonical);break}}}),b.size>0)?Array.from(b):a.split(",").map(a=>a.trim()).filter(Boolean)},t=e.filter(a=>{let b=a.customerName.toLowerCase().includes(i.toLowerCase()),c=a.email.toLowerCase().includes(i.toLowerCase()),d=a.service.toLowerCase().includes(i.toLowerCase());return b||c||d}).filter(a=>"ALL"===k||a.status===k),u=e.length,v=e.filter(a=>"PENDING"===a.status).length,w=e.filter(a=>"CLOSED"===a.status).length,x=e.filter(a=>"CANCELLED"===a.status).length;return(0,b.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:"2rem"},children:[(0,b.jsx)("div",{className:d.default.pageHeader,style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"},children:(0,b.jsxs)("div",{children:[(0,b.jsxs)("h1",{style:{color:"var(--primary)",fontSize:"2rem",display:"flex",alignItems:"center",gap:"10px"},children:[(0,b.jsx)("i",{className:"fa-solid fa-calendar-check"})," Bookings Manager"]}),(0,b.jsx)("p",{style:{color:"var(--text-light)",marginTop:"0.25rem"},children:"View, filter, close, and print customer laundry service orders."})]})}),(0,b.jsxs)("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:"1rem"},children:[(0,b.jsxs)("div",{style:{background:"white",padding:"1.25rem 1.5rem",borderRadius:"16px",boxShadow:"var(--shadow-sm)",border:"1px solid rgba(0,0,0,0.02)",display:"flex",alignItems:"center",gap:"1rem"},children:[(0,b.jsx)("div",{style:{width:"45px",height:"45px",borderRadius:"50%",background:"rgba(34, 41, 69, 0.05)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--primary)",fontSize:"1.2rem"},children:(0,b.jsx)("i",{className:"fa-solid fa-list-check"})}),(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{style:{fontSize:"0.8rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Total Bookings"}),(0,b.jsx)("div",{style:{fontSize:"1.5rem",fontWeight:"700",color:"var(--primary)"},children:u})]})]}),(0,b.jsxs)("div",{style:{background:"white",padding:"1.25rem 1.5rem",borderRadius:"16px",boxShadow:"var(--shadow-sm)",border:"1px solid rgba(0,0,0,0.02)",display:"flex",alignItems:"center",gap:"1rem"},children:[(0,b.jsx)("div",{style:{width:"45px",height:"45px",borderRadius:"50%",background:"rgba(245, 158, 11, 0.1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#f59e0b",fontSize:"1.2rem"},children:(0,b.jsx)("i",{className:"fa-solid fa-clock"})}),(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{style:{fontSize:"0.8rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Pending"}),(0,b.jsx)("div",{style:{fontSize:"1.5rem",fontWeight:"700",color:"#f59e0b"},children:v})]})]}),(0,b.jsxs)("div",{style:{background:"white",padding:"1.25rem 1.5rem",borderRadius:"16px",boxShadow:"var(--shadow-sm)",border:"1px solid rgba(0,0,0,0.02)",display:"flex",alignItems:"center",gap:"1rem"},children:[(0,b.jsx)("div",{style:{width:"45px",height:"45px",borderRadius:"50%",background:"rgba(16, 185, 129, 0.1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#10b981",fontSize:"1.2rem"},children:(0,b.jsx)("i",{className:"fa-solid fa-circle-check"})}),(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{style:{fontSize:"0.8rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Closed"}),(0,b.jsx)("div",{style:{fontSize:"1.5rem",fontWeight:"700",color:"#10b981"},children:w})]})]}),(0,b.jsxs)("div",{style:{background:"white",padding:"1.25rem 1.5rem",borderRadius:"16px",boxShadow:"var(--shadow-sm)",border:"1px solid rgba(0,0,0,0.02)",display:"flex",alignItems:"center",gap:"1rem"},children:[(0,b.jsx)("div",{style:{width:"45px",height:"45px",borderRadius:"50%",background:"rgba(239, 68, 68, 0.1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444",fontSize:"1.2rem"},children:(0,b.jsx)("i",{className:"fa-solid fa-circle-xmark"})}),(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{style:{fontSize:"0.8rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Cancelled"}),(0,b.jsx)("div",{style:{fontSize:"1.5rem",fontWeight:"700",color:"#ef4444"},children:x})]})]})]}),(0,b.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1rem",background:"white",padding:"1rem",borderRadius:"12px",boxShadow:"var(--shadow-sm)"},children:[(0,b.jsx)("div",{style:{display:"flex",gap:"0.25rem",background:"rgba(0,0,0,0.03)",padding:"4px",borderRadius:"25px"},children:[{id:"ALL",label:"All Bookings"},{id:"PENDING",label:"Pending"},{id:"CLOSED",label:"Closed"},{id:"CANCELLED",label:"Cancelled"}].map(a=>(0,b.jsx)("button",{onClick:()=>l(a.id),style:{padding:"0.4rem 1rem",borderRadius:"20px",border:"none",fontSize:"0.85rem",cursor:"pointer",fontWeight:"600",transition:"all 0.2s ease",background:k===a.id?"var(--primary)":"transparent",color:k===a.id?"white":"var(--text-light)"},children:a.label},a.id))}),(0,b.jsxs)("div",{style:{position:"relative",width:"300px"},children:[(0,b.jsx)("i",{className:"fa-solid fa-magnifying-glass",style:{position:"absolute",left:"15px",top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)"}}),(0,b.jsx)("input",{type:"text",placeholder:"Search name, email, or service...",value:i,onChange:a=>j(a.target.value),style:{width:"100%",padding:"0.5rem 1rem 0.5rem 2.5rem",borderRadius:"20px",border:"1px solid rgba(0,0,0,0.1)",outline:"none",fontSize:"0.85rem",background:"#fafafa"}})]})]}),(0,b.jsx)("div",{children:g?(0,b.jsx)("div",{style:{background:"white",padding:"4rem",borderRadius:"16px",textAlign:"center",boxShadow:"var(--shadow-sm)"},children:(0,b.jsx)("p",{style:{color:"var(--text-light)"},children:"Loading bookings data..."})}):0===t.length?(0,b.jsxs)("div",{style:{background:"white",padding:"4rem",borderRadius:"16px",textAlign:"center",boxShadow:"var(--shadow-sm)"},children:[(0,b.jsx)("i",{className:"fa-solid fa-inbox",style:{fontSize:"3rem",color:"var(--text-muted)",marginBottom:"1rem"}}),(0,b.jsx)("p",{style:{color:"var(--text-light)"},children:"No bookings match the filters."})]}):(0,b.jsx)("div",{style:{display:"flex",flexDirection:"column",gap:"1.5rem"},children:t.map(c=>{let d,e=r(c.service),f=s(e.services),g=a(c.pickupDate),h=c.phone.includes("WhatsApp"),i=c.phone.split("|")[0],j=i.replace(/\D/g,""),k=(i.includes("+")||j.startsWith("66"),"+"+j);return(0,b.jsxs)("div",{style:{background:"white",borderRadius:"16px",boxShadow:"var(--shadow)",border:"1px solid rgba(0,0,0,0.03)",overflow:"hidden",display:"flex",flexDirection:"column",transition:"transform 0.2s ease, box-shadow 0.2s ease"},children:[(0,b.jsxs)("div",{style:{padding:"1.25rem 1.5rem",borderBottom:"1px solid rgba(0,0,0,0.05)",background:"#fcfdfe",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1rem"},children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("h3",{style:{margin:0,color:"var(--primary)",fontSize:"1.25rem"},children:c.customerName}),(0,b.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"0.75rem",marginTop:"0.3rem",flexWrap:"wrap"},children:[(0,b.jsxs)("a",{href:`mailto:${c.email}`,style:{fontSize:"0.85rem",color:"var(--text-light)",display:"flex",alignItems:"center",gap:"4px"},children:[(0,b.jsx)("i",{className:"fa-solid fa-envelope",style:{color:"var(--text-muted)"}})," ",c.email]}),(0,b.jsx)("span",{style:{color:"var(--text-muted)",fontSize:"0.8rem"},children:"|"}),(0,b.jsxs)("a",{href:`tel:${c.phone.split("|")[0].replace(/\(WhatsApp\)/g,"").trim()}`,style:{fontSize:"0.85rem",color:"var(--text-light)",display:"flex",alignItems:"center",gap:"4px"},children:[(0,b.jsx)("i",{className:"fa-solid fa-phone",style:{color:"var(--text-muted)"}})," ",c.phone]}),h&&(0,b.jsxs)("a",{href:(d=c.phone.replace(/\D/g,""),`https://wa.me/${d}`),target:"_blank",rel:"noopener noreferrer",style:{background:"rgba(37, 211, 102, 0.08)",color:"#25D366",padding:"0.1rem 0.6rem",borderRadius:"12px",fontSize:"0.75rem",fontWeight:"700",display:"inline-flex",alignItems:"center",gap:"4px"},children:[(0,b.jsx)("i",{className:"fa-brands fa-whatsapp"})," Chat WhatsApp"]})]})]}),(0,b.jsx)("div",{style:{display:"flex",alignItems:"center",gap:"15px",flexWrap:"wrap"},children:(0,b.jsx)("span",{style:{padding:"0.4rem 0.9rem",borderRadius:"50px",fontSize:"0.75rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.05em",background:"PENDING"===c.status?"rgba(245, 158, 11, 0.1)":"CANCELLED"===c.status?"rgba(239, 68, 68, 0.1)":"rgba(16, 185, 129, 0.1)",color:"PENDING"===c.status?"#f59e0b":"CANCELLED"===c.status?"#ef4444":"#10b981"},children:c.status})})]}),(0,b.jsxs)("div",{style:{padding:"1.5rem",display:"flex",flexDirection:"column",gap:"1.25rem"},children:[(0,b.jsxs)("div",{style:{background:"rgba(34, 41, 69, 0.02)",padding:"1.2rem",borderRadius:"12px",border:"1px solid rgba(0,0,0,0.04)"},children:[(0,b.jsx)("div",{style:{fontSize:"0.75rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.5rem"},children:"Services Requested"}),(0,b.jsx)("div",{style:{display:"flex",flexWrap:"wrap",gap:"0.5rem"},children:f.length>0?f.map((a,c)=>(0,b.jsxs)("span",{style:{display:"inline-flex",alignItems:"center",gap:"6px",background:"rgba(34, 41, 69, 0.05)",color:"var(--primary)",border:"1px solid rgba(34, 41, 69, 0.1)",padding:"0.4rem 0.8rem",borderRadius:"8px",fontSize:"0.85rem",fontWeight:"600",boxShadow:"0 1px 2px rgba(0,0,0,0.02)"},children:[(0,b.jsx)("i",{className:"fa-solid fa-circle-check",style:{color:"#10b981",fontSize:"0.75rem"}}),a]},c)):(0,b.jsx)("span",{style:{color:"var(--text-muted)",fontSize:"0.9rem"},children:"No specified services."})})]}),(0,b.jsxs)("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:"1.5rem"},children:[(0,b.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:"0.75rem"},children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{style:{fontSize:"0.75rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Scheduled Pickup"}),(0,b.jsxs)("div",{style:{fontSize:"0.95rem",fontWeight:"600",color:"var(--text-dark)",marginTop:"0.15rem"},children:[(0,b.jsx)("i",{className:"fa-solid fa-calendar-day",style:{marginRight:"6px",color:"var(--primary)"}})," ",g]})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{style:{fontSize:"0.75rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Pickup Method"}),(0,b.jsx)("div",{style:{fontSize:"0.95rem",fontWeight:"500",color:"var(--text-dark)",marginTop:"0.15rem"},children:e.pickupMethod||"Not specified"})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{style:{fontSize:"0.75rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Payment Method"}),(0,b.jsxs)("div",{style:{fontSize:"0.95rem",fontWeight:"600",color:"var(--accent)",marginTop:"0.15rem"},children:[(0,b.jsx)("i",{className:"fa-solid fa-credit-card",style:{marginRight:"6px"}})," ",e.paymentMethod||"Not specified"]})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{style:{fontSize:"0.75rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Express Service"}),(0,b.jsxs)("div",{style:{fontSize:"0.95rem",fontWeight:"600",color:e.expressService&&"Standard"!==e.expressService?"var(--warning)":"var(--text-light)",marginTop:"0.15rem"},children:[(0,b.jsx)("i",{className:"fa-solid fa-bolt",style:{marginRight:"6px"}})," ",e.expressService||"Standard"]})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{style:{fontSize:"0.75rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Placed On"}),(0,b.jsx)("div",{style:{fontSize:"0.85rem",color:"var(--text-light)",marginTop:"0.15rem"},children:a(c.createdAt)})]})]}),(0,b.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:"0.75rem"},children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{style:{fontSize:"0.75rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Pickup Address"}),(0,b.jsxs)("div",{style:{fontSize:"0.9rem",color:"var(--text-dark)",marginTop:"0.15rem",lineHeight:"1.4"},children:[(0,b.jsx)("i",{className:"fa-solid fa-location-dot",style:{marginRight:"6px",color:"var(--text-muted)"}})," ",e.address||"No address provided"]}),e.roomNo&&(0,b.jsxs)("div",{style:{display:"inline-flex",alignItems:"center",gap:"6px",background:"rgba(245, 158, 11, 0.08)",border:"1px solid rgba(245, 158, 11, 0.2)",color:"#d97706",padding:"0.3rem 0.6rem",borderRadius:"6px",fontSize:"0.8rem",fontWeight:"700",marginTop:"0.4rem"},children:[(0,b.jsx)("i",{className:"fa-solid fa-door-open"})," Room ",e.roomNo]})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{style:{fontSize:"0.75rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Delivery Address"}),(0,b.jsxs)("div",{style:{fontSize:"0.9rem",color:"var(--text-dark)",marginTop:"0.15rem",lineHeight:"1.4"},children:[(0,b.jsx)("i",{className:"fa-solid fa-truck",style:{marginRight:"6px",color:"var(--text-muted)"}})," ",e.delivery||"Same as pickup"]}),e.deliveryRoomNo&&(0,b.jsxs)("div",{style:{display:"inline-flex",alignItems:"center",gap:"6px",background:"rgba(245, 158, 11, 0.08)",border:"1px solid rgba(245, 158, 11, 0.2)",color:"#d97706",padding:"0.3rem 0.6rem",borderRadius:"6px",fontSize:"0.8rem",fontWeight:"700",marginTop:"0.4rem"},children:[(0,b.jsx)("i",{className:"fa-solid fa-door-open"})," Room ",e.deliveryRoomNo]})]})]})]}),(0,b.jsxs)("div",{style:{background:"rgba(34, 41, 69, 0.01)",border:"1px solid rgba(0,0,0,0.06)",borderRadius:"12px",padding:"1rem",marginTop:"0.5rem"},children:[(0,b.jsxs)("div",{style:{fontSize:"0.75rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.6rem",display:"flex",justifyContent:"space-between",alignItems:"center"},children:[(0,b.jsxs)("span",{style:{display:"flex",alignItems:"center",gap:"6px"},children:[(0,b.jsx)("i",{className:"fa-solid fa-signal",style:{color:"var(--primary)"}})," Messaging Channels Quick-Link"]}),(0,b.jsxs)("span",{style:{fontSize:"0.7rem",background:"rgba(34, 41, 69, 0.06)",color:"var(--primary)",padding:"2px 8px",borderRadius:"50px",fontWeight:"700",display:"inline-flex",alignItems:"center",gap:"4px"},children:[(0,b.jsx)("i",{className:"fa-solid fa-circle-info",style:{fontSize:"0.6rem"}})," Ready to Verify"]})]}),(0,b.jsxs)("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))",gap:"0.75rem"},children:[(0,b.jsxs)("div",{style:{background:"white",border:"1px solid rgba(0,0,0,0.04)",padding:"0.75rem",borderRadius:"8px",display:"flex",flexDirection:"column",gap:"0.4rem"},children:[(0,b.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"6px"},children:[(0,b.jsx)("i",{className:"fa-brands fa-whatsapp",style:{color:"#25D366",fontSize:"1.15rem"}}),(0,b.jsx)("span",{style:{fontSize:"0.85rem",fontWeight:"700",color:"var(--text-dark)"},children:"WhatsApp"})]}),(0,b.jsx)("div",{style:{fontSize:"0.72rem",color:h?"#10b981":"#64748b",fontWeight:"600"},children:h?"● Customer Preferred":"● Unmarked (Click to check)"}),(0,b.jsxs)("a",{href:`https://wa.me/${j}`,target:"_blank",rel:"noopener noreferrer",style:{fontSize:"0.72rem",color:"var(--primary)",fontWeight:"700",textDecoration:"none",marginTop:"0.5rem",display:"inline-flex",alignItems:"center",gap:"4px"},children:["Verify WhatsApp ",(0,b.jsx)("i",{className:"fa-solid fa-chevron-right",style:{fontSize:"0.6rem"}})]})]}),(0,b.jsxs)("div",{style:{background:"white",border:"1px solid rgba(0,0,0,0.04)",padding:"0.75rem",borderRadius:"8px",display:"flex",flexDirection:"column",gap:"0.4rem"},children:[(0,b.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"6px"},children:[(0,b.jsx)("i",{className:"fa-brands fa-telegram",style:{color:"#0088cc",fontSize:"1.15rem"}}),(0,b.jsx)("span",{style:{fontSize:"0.85rem",fontWeight:"700",color:"var(--text-dark)"},children:"Telegram"})]}),(0,b.jsx)("div",{style:{fontSize:"0.72rem",color:"#64748b",fontWeight:"600"},children:"● Click to check status"}),(0,b.jsxs)("a",{href:`https://t.me/${k}`,target:"_blank",rel:"noopener noreferrer",style:{fontSize:"0.72rem",color:"var(--primary)",fontWeight:"700",textDecoration:"none",marginTop:"0.5rem",display:"inline-flex",alignItems:"center",gap:"4px"},children:["Verify Telegram ",(0,b.jsx)("i",{className:"fa-solid fa-chevron-right",style:{fontSize:"0.6rem"}})]})]})]})]}),e.notes&&(0,b.jsxs)("div",{style:{background:"#fffbeb",border:"1px solid #fef3c7",padding:"1rem",borderRadius:"8px",display:"flex",gap:"0.5rem",alignItems:"flex-start"},children:[(0,b.jsx)("i",{className:"fa-solid fa-circle-info",style:{color:"#d97706",marginTop:"2px"}}),(0,b.jsxs)("div",{children:[(0,b.jsx)("div",{style:{fontSize:"0.75rem",color:"#b45309",fontWeight:"600",textTransform:"uppercase"},children:"Special Instructions"}),(0,b.jsx)("p",{style:{margin:"0.2rem 0 0 0",fontSize:"0.9rem",color:"#78350f",fontStyle:"italic",lineHeight:"1.4"},children:e.notes})]})]})]}),(0,b.jsxs)("div",{style:{padding:"1rem 1.5rem",background:"#fcfdfe",borderTop:"1px solid rgba(0,0,0,0.05)",display:"flex",justifyContent:"space-between",alignItems:"center"},children:[(0,b.jsxs)("button",{onClick:()=>{let b,d,e,f,g;return b=window.open("","_blank"),d=r(c.service),e=a(c.pickupDate),f=a(c.createdAt),g=s(d.services),void(b.document.write(`
      <html>
        <head>
          <title>Receipt - Booking #${c.id.slice(0,8)}</title>
          <style>
            body {
              font-family: 'Inter', sans-serif;
              color: #0f172a;
              padding: 40px;
              background: #ffffff;
              margin: 0;
              line-height: 1.5;
            }
            .header {
              border-bottom: 2px solid #222945;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .brand {
              font-size: 24px;
              font-weight: 800;
              color: #222945;
              letter-spacing: -0.02em;
            }
            .title {
              font-size: 20px;
              font-weight: 700;
              color: #475569;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-bottom: 40px;
            }
            .section-title {
              font-size: 13px;
              font-weight: 700;
              text-transform: uppercase;
              color: #64748b;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 8px;
              margin-bottom: 15px;
              letter-spacing: 0.05em;
            }
            .info-group {
              margin-bottom: 12px;
            }
            .info-label {
              font-size: 11px;
              color: #64748b;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.02em;
            }
            .info-value {
              font-size: 15px;
              font-weight: 500;
              margin-top: 2px;
            }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 50px;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
            }
            .badge-pending { background: #fef3c7; color: #d97706; }
            .badge-closed { background: #d1fae5; color: #059669; }
            .badge-cancelled { background: #fee2e2; color: #dc2626; }
            
            .service-badge {
              display: inline-block;
              background: #f1f5f9;
              border: 1px solid #cbd5e1;
              color: #334155;
              padding: 4px 10px;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 600;
              margin-right: 8px;
              margin-bottom: 8px;
            }
            .room-box {
              display: inline-block;
              background: #fffbeb;
              border: 1px solid #fef3c7;
              color: #b45309;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 700;
              margin-top: 4px;
            }

            .footer {
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
              margin-top: 50px;
              text-align: center;
              font-size: 12px;
              color: #94a3b8;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">THAT LAUNDRY SHOP</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Premium Laundry & Dry Cleaning</div>
            </div>
            <div>
              <div class="title">Booking Invoice</div>
              <div style="font-size: 12px; color: #64748b; text-align: right; margin-top: 4px;">Order ID: #${c.id.slice(0,8)}</div>
            </div>
          </div>

          <div class="grid">
            <div>
              <div class="section-title">Customer Information</div>
              <div class="info-group">
                <div class="info-label">Name</div>
                <div class="info-value">${c.customerName}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Email</div>
                <div class="info-value">${c.email}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Phone</div>
                <div class="info-value">${c.phone}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Booking Status</div>
                <div style="margin-top: 5px;">
                  <span class="badge badge-${c.status.toLowerCase()}">${c.status}</span>
                </div>
              </div>
            </div>

            <div>
              <div class="section-title">Logistics & Timing</div>
              <div class="info-group">
                <div class="info-label">Scheduled Pickup</div>
                <div class="info-value">${e}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Booking Placed On</div>
                <div class="info-value">${f}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Pickup Method</div>
                <div class="info-value">${d.pickupMethod||"N/A"}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Preferred Time</div>
                <div class="info-value">${d.time||"N/A"}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Payment Method</div>
                <div class="info-value">${d.paymentMethod||"N/A"}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Express Option</div>
                <div class="info-value">${d.expressService||"Standard"}</div>
              </div>
            </div>
          </div>

          <div class="section-title">Requested Services</div>
          <div style="background: #f8fafc; padding: 20px 20px 12px 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 30px;">
            ${0===g.length?"None selected":g.map(a=>`<span class="service-badge">${a}</span>`).join("")}
          </div>

          <div class="grid">
            <div>
              <div class="section-title">Pickup Address</div>
              <div class="info-value" style="line-height: 1.5; font-size: 14px;">${d.address||"N/A"}</div>
              ${d.roomNo?`<div class="room-box">Room ${d.roomNo}</div>`:""}
            </div>
            <div>
              <div class="section-title">Delivery Address</div>
              <div class="info-value" style="line-height: 1.5; font-size: 14px;">${d.delivery||"N/A"}</div>
              ${d.deliveryRoomNo?`<div class="room-box">Room ${d.deliveryRoomNo}</div>`:""}
            </div>
          </div>

          ${d.notes?`
            <div style="margin-top: 30px;">
              <div class="section-title">Special Instructions / Notes</div>
              <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 15px; border-radius: 8px; font-style: italic; line-height: 1.5; font-size: 14px;">
                ${d.notes}
              </div>
            </div>
          `:""}

          <div class="footer">
            Thank you for choosing That Laundry Shop. For support, call +66 94 691 6668.
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `),b.document.close())},style:{background:"rgba(34, 41, 69, 0.06)",color:"var(--primary)",border:"none",padding:"0.4rem 1rem",borderRadius:"8px",fontSize:"0.8rem",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",transition:"all 0.2s ease"},onMouseEnter:a=>a.currentTarget.style.background="rgba(34, 41, 69, 0.12)",onMouseLeave:a=>a.currentTarget.style.background="rgba(34, 41, 69, 0.06)",children:[(0,b.jsx)("i",{className:"fa-solid fa-file-pdf"})," Export PDF / Receipt"]}),"PENDING"===c.status&&(0,b.jsxs)("div",{style:{display:"flex",gap:"0.5rem"},children:[(0,b.jsxs)("button",{onClick:()=>q(c.id,"CLOSED"),style:{background:"#10b981",color:"white",border:"none",padding:"0.4rem 1rem",borderRadius:"8px",fontSize:"0.8rem",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px",boxShadow:"0 2px 4px rgba(16, 185, 129, 0.2)"},children:[(0,b.jsx)("i",{className:"fa-solid fa-check"})," Close Order"]}),(0,b.jsxs)("button",{onClick:()=>q(c.id,"CANCELLED"),style:{background:"transparent",border:"1px solid #ef4444",color:"#ef4444",padding:"0.4rem 1rem",borderRadius:"8px",fontSize:"0.8rem",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"},children:[(0,b.jsx)("i",{className:"fa-solid fa-xmark"})," Cancel Order"]})]})]})]},c.id)})})})]})}])}];

//# sourceMappingURL=src_app_admin_dashboard_bookings_page_0j_8~1t.js.map