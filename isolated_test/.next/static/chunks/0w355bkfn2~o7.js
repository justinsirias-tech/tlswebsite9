(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,33792,e=>{e.v({actionBtn:"admin-module__4WpgRW__actionBtn",actionButtons:"admin-module__4WpgRW__actionButtons",activeTab:"admin-module__4WpgRW__activeTab",dashboardLayout:"admin-module__4WpgRW__dashboardLayout",dataTable:"admin-module__4WpgRW__dataTable",delete:"admin-module__4WpgRW__delete",deleteBtn:"admin-module__4WpgRW__deleteBtn",edit:"admin-module__4WpgRW__edit",editBtn:"admin-module__4WpgRW__editBtn",inlineInput:"admin-module__4WpgRW__inlineInput",loginCard:"admin-module__4WpgRW__loginCard",loginContainer:"admin-module__4WpgRW__loginContainer",mainContent:"admin-module__4WpgRW__mainContent",modalActions:"admin-module__4WpgRW__modalActions",modalContent:"admin-module__4WpgRW__modalContent",modalOverlay:"admin-module__4WpgRW__modalOverlay",navLink:"admin-module__4WpgRW__navLink",navLinkActive:"admin-module__4WpgRW__navLinkActive",pageHeader:"admin-module__4WpgRW__pageHeader",sidebar:"admin-module__4WpgRW__sidebar",sidebarHeader:"admin-module__4WpgRW__sidebarHeader",sidebarNav:"admin-module__4WpgRW__sidebarNav",tabBtn:"admin-module__4WpgRW__tabBtn",table:"admin-module__4WpgRW__table",tableContainer:"admin-module__4WpgRW__tableContainer",tabsContainer:"admin-module__4WpgRW__tabsContainer"})},37994,e=>{"use strict";var i=e.i(43476),r=e.i(71645),t=e.i(33792);e.s(["default",0,function(){let e=e=>{if(!e)return"";let i=new Date(e);if(isNaN(i.getTime()))return"";let r=String(i.getDate()).padStart(2,"0"),t=String(i.getMonth()+1).padStart(2,"0"),a=i.getFullYear(),s=String(i.getHours()).padStart(2,"0"),o=String(i.getMinutes()).padStart(2,"0");return`${r}/${t}/${a} ${s}:${o}`},[a,s]=(0,r.useState)([]),[o,n]=(0,r.useState)(!0),[d,l]=(0,r.useState)(""),[c,p]=(0,r.useState)("ALL"),[m,g]=(0,r.useState)([]);(0,r.useEffect)(()=>{f(),x()},[]);let f=async()=>{try{let e=await fetch("/api/bookings"),i=await e.json();s(i)}catch(e){console.error("Failed to fetch bookings:",e)}finally{n(!1)}},x=async()=>{try{let e=await fetch("/api/admin/users");if(e.ok){let i=await e.json();g(i)}}catch(e){console.error("Failed to fetch admin users:",e)}},h=async(e,i)=>{if(confirm(`Are you sure you want to change this booking status to ${i}?`))try{(await fetch("/api/bookings",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:e,status:i})})).ok?s(r=>r.map(r=>r.id===e?{...r,status:i}:r)):alert("Failed to update booking status.")}catch(e){console.error(e),alert("Error updating status.")}},v=e=>{let i={services:"",address:"",delivery:"",pickupMethod:"",time:"",paymentMethod:"",expressService:"",notes:"",roomNo:"",deliveryRoomNo:""};return e&&(e.split("\n").forEach(e=>{let r=e.trim();if(r.startsWith("Services:"))i.services=r.replace("Services:","").trim();else if(r.startsWith("Address:")){let e=r.replace("Address:","").trim(),t=e.match(/Room\s+([^,]+)/i);t?(i.roomNo=t[1].trim(),i.address=e.replace(/,?\s*Room\s+[^,]+,?/i,"").trim()):i.address=e}else if(r.startsWith("Delivery:")){let e=r.replace("Delivery:","").trim(),t=e.match(/Room\s+([^,]+)/i);t?(i.deliveryRoomNo=t[1].trim(),i.delivery=e.replace(/,?\s*Room\s+[^,]+,?/i,"").trim()):i.delivery=e}else r.startsWith("Pickup Method:")?i.pickupMethod=r.replace("Pickup Method:","").trim():r.startsWith("Time:")?i.time=r.replace("Time:","").trim():r.startsWith("Payment Method:")?i.paymentMethod=r.replace("Payment Method:","").trim():r.startsWith("Express Service:")?i.expressService=r.replace("Express Service:","").trim():r.startsWith("Notes:")&&(i.notes=r.replace("Notes:","").trim())}),!i.services&&e&&(e.includes("Services:")?i.services="None selected":i.services=e)),i},u=e=>{if(!e)return[];if(e.includes(";"))return e.split(";").map(e=>e.trim()).filter(Boolean);let i=new Set,r=e.toLowerCase().replace(/\s*\/\s*/g,"/").replace(/\s*&\s*/g,"&");return([{canonical:"Wash & Fold (Weight)",patterns:["wash & fold","wash and fold","wash & fold (weight)","wash/fold"]},{canonical:"Wash, Iron & Fold (Weight)",patterns:["wash, iron & fold","wash, iron and fold","wash/iron/fold","wash, iron & fold (weight)","wash/iron/fold (weight)"]},{canonical:"Wash, Iron & Hang (Weight)",patterns:["wash, iron & hang","wash, iron and hang","wash/iron/hang","wash, iron & hang (weight)","wash/iron/hang (weight)"]},{canonical:"Dry cleaning",patterns:["dry cleaning","dry clean","dry-cleaning"]},{canonical:"Linens & Beddings",patterns:["linens & beddings","linens and beddings","linens/beddings","linens","beddings","bedding"]},{canonical:"Mixed Service",patterns:["mixed service","mixed"]},{canonical:"Ironing & Pressing only",patterns:["ironing & pressing only","ironing & pressing","ironing and pressing","ironing only","pressing only"]},{canonical:"Others",patterns:["others","other"]}].forEach(e=>{for(let t of e.patterns){let a=t.toLowerCase().replace(/\s*\/\s*/g,"/").replace(/\s*&\s*/g,"&");if(r.includes(a)){i.add(e.canonical);break}}}),i.size>0)?Array.from(i):e.split(",").map(e=>e.trim()).filter(Boolean)},b=a.filter(e=>{let i=e.customerName.toLowerCase().includes(d.toLowerCase()),r=e.email.toLowerCase().includes(d.toLowerCase()),t=e.service.toLowerCase().includes(d.toLowerCase());return i||r||t}).filter(e=>"ALL"===c||e.status===c),y=a.length,j=a.filter(e=>"PENDING"===e.status).length,S=a.filter(e=>"CLOSED"===e.status).length,W=a.filter(e=>"CANCELLED"===e.status).length;return(0,i.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:"2rem"},children:[(0,i.jsx)("div",{className:t.default.pageHeader,style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"},children:(0,i.jsxs)("div",{children:[(0,i.jsxs)("h1",{style:{color:"var(--primary)",fontSize:"2rem",display:"flex",alignItems:"center",gap:"10px"},children:[(0,i.jsx)("i",{className:"fa-solid fa-calendar-check"})," Bookings Manager"]}),(0,i.jsx)("p",{style:{color:"var(--text-light)",marginTop:"0.25rem"},children:"View, filter, close, and print customer laundry service orders."})]})}),(0,i.jsxs)("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:"1rem"},children:[(0,i.jsxs)("div",{style:{background:"white",padding:"1.25rem 1.5rem",borderRadius:"16px",boxShadow:"var(--shadow-sm)",border:"1px solid rgba(0,0,0,0.02)",display:"flex",alignItems:"center",gap:"1rem"},children:[(0,i.jsx)("div",{style:{width:"45px",height:"45px",borderRadius:"50%",background:"rgba(34, 41, 69, 0.05)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--primary)",fontSize:"1.2rem"},children:(0,i.jsx)("i",{className:"fa-solid fa-list-check"})}),(0,i.jsxs)("div",{children:[(0,i.jsx)("div",{style:{fontSize:"0.8rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Total Bookings"}),(0,i.jsx)("div",{style:{fontSize:"1.5rem",fontWeight:"700",color:"var(--primary)"},children:y})]})]}),(0,i.jsxs)("div",{style:{background:"white",padding:"1.25rem 1.5rem",borderRadius:"16px",boxShadow:"var(--shadow-sm)",border:"1px solid rgba(0,0,0,0.02)",display:"flex",alignItems:"center",gap:"1rem"},children:[(0,i.jsx)("div",{style:{width:"45px",height:"45px",borderRadius:"50%",background:"rgba(245, 158, 11, 0.1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#f59e0b",fontSize:"1.2rem"},children:(0,i.jsx)("i",{className:"fa-solid fa-clock"})}),(0,i.jsxs)("div",{children:[(0,i.jsx)("div",{style:{fontSize:"0.8rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Pending"}),(0,i.jsx)("div",{style:{fontSize:"1.5rem",fontWeight:"700",color:"#f59e0b"},children:j})]})]}),(0,i.jsxs)("div",{style:{background:"white",padding:"1.25rem 1.5rem",borderRadius:"16px",boxShadow:"var(--shadow-sm)",border:"1px solid rgba(0,0,0,0.02)",display:"flex",alignItems:"center",gap:"1rem"},children:[(0,i.jsx)("div",{style:{width:"45px",height:"45px",borderRadius:"50%",background:"rgba(16, 185, 129, 0.1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#10b981",fontSize:"1.2rem"},children:(0,i.jsx)("i",{className:"fa-solid fa-circle-check"})}),(0,i.jsxs)("div",{children:[(0,i.jsx)("div",{style:{fontSize:"0.8rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Closed"}),(0,i.jsx)("div",{style:{fontSize:"1.5rem",fontWeight:"700",color:"#10b981"},children:S})]})]}),(0,i.jsxs)("div",{style:{background:"white",padding:"1.25rem 1.5rem",borderRadius:"16px",boxShadow:"var(--shadow-sm)",border:"1px solid rgba(0,0,0,0.02)",display:"flex",alignItems:"center",gap:"1rem"},children:[(0,i.jsx)("div",{style:{width:"45px",height:"45px",borderRadius:"50%",background:"rgba(239, 68, 68, 0.1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444",fontSize:"1.2rem"},children:(0,i.jsx)("i",{className:"fa-solid fa-circle-xmark"})}),(0,i.jsxs)("div",{children:[(0,i.jsx)("div",{style:{fontSize:"0.8rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Cancelled"}),(0,i.jsx)("div",{style:{fontSize:"1.5rem",fontWeight:"700",color:"#ef4444"},children:W})]})]})]}),(0,i.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1rem",background:"white",padding:"1rem",borderRadius:"12px",boxShadow:"var(--shadow-sm)"},children:[(0,i.jsx)("div",{style:{display:"flex",gap:"0.25rem",background:"rgba(0,0,0,0.03)",padding:"4px",borderRadius:"25px"},children:[{id:"ALL",label:"All Bookings"},{id:"PENDING",label:"Pending"},{id:"CLOSED",label:"Closed"},{id:"CANCELLED",label:"Cancelled"}].map(e=>(0,i.jsx)("button",{onClick:()=>p(e.id),style:{padding:"0.4rem 1rem",borderRadius:"20px",border:"none",fontSize:"0.85rem",cursor:"pointer",fontWeight:"600",transition:"all 0.2s ease",background:c===e.id?"var(--primary)":"transparent",color:c===e.id?"white":"var(--text-light)"},children:e.label},e.id))}),(0,i.jsxs)("div",{style:{position:"relative",width:"300px"},children:[(0,i.jsx)("i",{className:"fa-solid fa-magnifying-glass",style:{position:"absolute",left:"15px",top:"50%",transform:"translateY(-50%)",color:"var(--text-muted)"}}),(0,i.jsx)("input",{type:"text",placeholder:"Search name, email, or service...",value:d,onChange:e=>l(e.target.value),style:{width:"100%",padding:"0.5rem 1rem 0.5rem 2.5rem",borderRadius:"20px",border:"1px solid rgba(0,0,0,0.1)",outline:"none",fontSize:"0.85rem",background:"#fafafa"}})]})]}),(0,i.jsx)("div",{children:o?(0,i.jsx)("div",{style:{background:"white",padding:"4rem",borderRadius:"16px",textAlign:"center",boxShadow:"var(--shadow-sm)"},children:(0,i.jsx)("p",{style:{color:"var(--text-light)"},children:"Loading bookings data..."})}):0===b.length?(0,i.jsxs)("div",{style:{background:"white",padding:"4rem",borderRadius:"16px",textAlign:"center",boxShadow:"var(--shadow-sm)"},children:[(0,i.jsx)("i",{className:"fa-solid fa-inbox",style:{fontSize:"3rem",color:"var(--text-muted)",marginBottom:"1rem"}}),(0,i.jsx)("p",{style:{color:"var(--text-light)"},children:"No bookings match the filters."})]}):(0,i.jsx)("div",{style:{display:"flex",flexDirection:"column",gap:"1.5rem"},children:b.map(r=>{let t,a=v(r.service),s=u(a.services),o=e(r.pickupDate),n=r.phone.includes("WhatsApp"),d=r.phone.split("|")[0],l=d.replace(/\D/g,""),c=(d.includes("+")||l.startsWith("66"),"+"+l);return(0,i.jsxs)("div",{style:{background:"white",borderRadius:"16px",boxShadow:"var(--shadow)",border:"1px solid rgba(0,0,0,0.03)",overflow:"hidden",display:"flex",flexDirection:"column",transition:"transform 0.2s ease, box-shadow 0.2s ease"},children:[(0,i.jsxs)("div",{style:{padding:"1.25rem 1.5rem",borderBottom:"1px solid rgba(0,0,0,0.05)",background:"#fcfdfe",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1rem"},children:[(0,i.jsxs)("div",{children:[(0,i.jsx)("h3",{style:{margin:0,color:"var(--primary)",fontSize:"1.25rem"},children:r.customerName}),(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"0.75rem",marginTop:"0.3rem",flexWrap:"wrap"},children:[(0,i.jsxs)("a",{href:`mailto:${r.email}`,style:{fontSize:"0.85rem",color:"var(--text-light)",display:"flex",alignItems:"center",gap:"4px"},children:[(0,i.jsx)("i",{className:"fa-solid fa-envelope",style:{color:"var(--text-muted)"}})," ",r.email]}),(0,i.jsx)("span",{style:{color:"var(--text-muted)",fontSize:"0.8rem"},children:"|"}),(0,i.jsxs)("a",{href:`tel:${r.phone.split("|")[0].replace(/\(WhatsApp\)/g,"").trim()}`,style:{fontSize:"0.85rem",color:"var(--text-light)",display:"flex",alignItems:"center",gap:"4px"},children:[(0,i.jsx)("i",{className:"fa-solid fa-phone",style:{color:"var(--text-muted)"}})," ",r.phone]}),n&&(0,i.jsxs)("a",{href:(t=r.phone.replace(/\D/g,""),`https://wa.me/${t}`),target:"_blank",rel:"noopener noreferrer",style:{background:"rgba(37, 211, 102, 0.08)",color:"#25D366",padding:"0.1rem 0.6rem",borderRadius:"12px",fontSize:"0.75rem",fontWeight:"700",display:"inline-flex",alignItems:"center",gap:"4px"},children:[(0,i.jsx)("i",{className:"fa-brands fa-whatsapp"})," Chat WhatsApp"]})]})]}),(0,i.jsx)("div",{style:{display:"flex",alignItems:"center",gap:"15px",flexWrap:"wrap"},children:(0,i.jsx)("span",{style:{padding:"0.4rem 0.9rem",borderRadius:"50px",fontSize:"0.75rem",fontWeight:"700",textTransform:"uppercase",letterSpacing:"0.05em",background:"PENDING"===r.status?"rgba(245, 158, 11, 0.1)":"CANCELLED"===r.status?"rgba(239, 68, 68, 0.1)":"rgba(16, 185, 129, 0.1)",color:"PENDING"===r.status?"#f59e0b":"CANCELLED"===r.status?"#ef4444":"#10b981"},children:r.status})})]}),(0,i.jsxs)("div",{style:{padding:"1.5rem",display:"flex",flexDirection:"column",gap:"1.25rem"},children:[(0,i.jsxs)("div",{style:{background:"rgba(34, 41, 69, 0.02)",padding:"1.2rem",borderRadius:"12px",border:"1px solid rgba(0,0,0,0.04)"},children:[(0,i.jsx)("div",{style:{fontSize:"0.75rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.5rem"},children:"Services Requested"}),(0,i.jsx)("div",{style:{display:"flex",flexWrap:"wrap",gap:"0.5rem"},children:s.length>0?s.map((e,r)=>(0,i.jsxs)("span",{style:{display:"inline-flex",alignItems:"center",gap:"6px",background:"rgba(34, 41, 69, 0.05)",color:"var(--primary)",border:"1px solid rgba(34, 41, 69, 0.1)",padding:"0.4rem 0.8rem",borderRadius:"8px",fontSize:"0.85rem",fontWeight:"600",boxShadow:"0 1px 2px rgba(0,0,0,0.02)"},children:[(0,i.jsx)("i",{className:"fa-solid fa-circle-check",style:{color:"#10b981",fontSize:"0.75rem"}}),e]},r)):(0,i.jsx)("span",{style:{color:"var(--text-muted)",fontSize:"0.9rem"},children:"No specified services."})})]}),(0,i.jsxs)("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:"1.5rem"},children:[(0,i.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:"0.75rem"},children:[(0,i.jsxs)("div",{children:[(0,i.jsx)("div",{style:{fontSize:"0.75rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Scheduled Pickup"}),(0,i.jsxs)("div",{style:{fontSize:"0.95rem",fontWeight:"600",color:"var(--text-dark)",marginTop:"0.15rem"},children:[(0,i.jsx)("i",{className:"fa-solid fa-calendar-day",style:{marginRight:"6px",color:"var(--primary)"}})," ",o]})]}),(0,i.jsxs)("div",{children:[(0,i.jsx)("div",{style:{fontSize:"0.75rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Pickup Method"}),(0,i.jsx)("div",{style:{fontSize:"0.95rem",fontWeight:"500",color:"var(--text-dark)",marginTop:"0.15rem"},children:a.pickupMethod||"Not specified"})]}),(0,i.jsxs)("div",{children:[(0,i.jsx)("div",{style:{fontSize:"0.75rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Payment Method"}),(0,i.jsxs)("div",{style:{fontSize:"0.95rem",fontWeight:"600",color:"var(--accent)",marginTop:"0.15rem"},children:[(0,i.jsx)("i",{className:"fa-solid fa-credit-card",style:{marginRight:"6px"}})," ",a.paymentMethod||"Not specified"]})]}),(0,i.jsxs)("div",{children:[(0,i.jsx)("div",{style:{fontSize:"0.75rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Express Service"}),(0,i.jsxs)("div",{style:{fontSize:"0.95rem",fontWeight:"600",color:a.expressService&&"Standard"!==a.expressService?"var(--warning)":"var(--text-light)",marginTop:"0.15rem"},children:[(0,i.jsx)("i",{className:"fa-solid fa-bolt",style:{marginRight:"6px"}})," ",a.expressService||"Standard"]})]}),(0,i.jsxs)("div",{children:[(0,i.jsx)("div",{style:{fontSize:"0.75rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Placed On"}),(0,i.jsx)("div",{style:{fontSize:"0.85rem",color:"var(--text-light)",marginTop:"0.15rem"},children:e(r.createdAt)})]})]}),(0,i.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:"0.75rem"},children:[(0,i.jsxs)("div",{children:[(0,i.jsx)("div",{style:{fontSize:"0.75rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Pickup Address"}),(0,i.jsxs)("div",{style:{fontSize:"0.9rem",color:"var(--text-dark)",marginTop:"0.15rem",lineHeight:"1.4"},children:[(0,i.jsx)("i",{className:"fa-solid fa-location-dot",style:{marginRight:"6px",color:"var(--text-muted)"}})," ",a.address||"No address provided"]}),a.roomNo&&(0,i.jsxs)("div",{style:{display:"inline-flex",alignItems:"center",gap:"6px",background:"rgba(245, 158, 11, 0.08)",border:"1px solid rgba(245, 158, 11, 0.2)",color:"#d97706",padding:"0.3rem 0.6rem",borderRadius:"6px",fontSize:"0.8rem",fontWeight:"700",marginTop:"0.4rem"},children:[(0,i.jsx)("i",{className:"fa-solid fa-door-open"})," Room ",a.roomNo]})]}),(0,i.jsxs)("div",{children:[(0,i.jsx)("div",{style:{fontSize:"0.75rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase"},children:"Delivery Address"}),(0,i.jsxs)("div",{style:{fontSize:"0.9rem",color:"var(--text-dark)",marginTop:"0.15rem",lineHeight:"1.4"},children:[(0,i.jsx)("i",{className:"fa-solid fa-truck",style:{marginRight:"6px",color:"var(--text-muted)"}})," ",a.delivery||"Same as pickup"]}),a.deliveryRoomNo&&(0,i.jsxs)("div",{style:{display:"inline-flex",alignItems:"center",gap:"6px",background:"rgba(245, 158, 11, 0.08)",border:"1px solid rgba(245, 158, 11, 0.2)",color:"#d97706",padding:"0.3rem 0.6rem",borderRadius:"6px",fontSize:"0.8rem",fontWeight:"700",marginTop:"0.4rem"},children:[(0,i.jsx)("i",{className:"fa-solid fa-door-open"})," Room ",a.deliveryRoomNo]})]})]})]}),(0,i.jsxs)("div",{style:{background:"rgba(34, 41, 69, 0.01)",border:"1px solid rgba(0,0,0,0.06)",borderRadius:"12px",padding:"1rem",marginTop:"0.5rem"},children:[(0,i.jsxs)("div",{style:{fontSize:"0.75rem",color:"var(--text-muted)",fontWeight:"600",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.6rem",display:"flex",justifyContent:"space-between",alignItems:"center"},children:[(0,i.jsxs)("span",{style:{display:"flex",alignItems:"center",gap:"6px"},children:[(0,i.jsx)("i",{className:"fa-solid fa-signal",style:{color:"var(--primary)"}})," Messaging Channels Quick-Link"]}),(0,i.jsxs)("span",{style:{fontSize:"0.7rem",background:"rgba(34, 41, 69, 0.06)",color:"var(--primary)",padding:"2px 8px",borderRadius:"50px",fontWeight:"700",display:"inline-flex",alignItems:"center",gap:"4px"},children:[(0,i.jsx)("i",{className:"fa-solid fa-circle-info",style:{fontSize:"0.6rem"}})," Ready to Verify"]})]}),(0,i.jsxs)("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))",gap:"0.75rem"},children:[(0,i.jsxs)("div",{style:{background:"white",border:"1px solid rgba(0,0,0,0.04)",padding:"0.75rem",borderRadius:"8px",display:"flex",flexDirection:"column",gap:"0.4rem"},children:[(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"6px"},children:[(0,i.jsx)("i",{className:"fa-brands fa-whatsapp",style:{color:"#25D366",fontSize:"1.15rem"}}),(0,i.jsx)("span",{style:{fontSize:"0.85rem",fontWeight:"700",color:"var(--text-dark)"},children:"WhatsApp"})]}),(0,i.jsx)("div",{style:{fontSize:"0.72rem",color:n?"#10b981":"#64748b",fontWeight:"600"},children:n?"● Customer Preferred":"● Unmarked (Click to check)"}),(0,i.jsxs)("a",{href:`https://wa.me/${l}`,target:"_blank",rel:"noopener noreferrer",style:{fontSize:"0.72rem",color:"var(--primary)",fontWeight:"700",textDecoration:"none",marginTop:"0.5rem",display:"inline-flex",alignItems:"center",gap:"4px"},children:["Verify WhatsApp ",(0,i.jsx)("i",{className:"fa-solid fa-chevron-right",style:{fontSize:"0.6rem"}})]})]}),(0,i.jsxs)("div",{style:{background:"white",border:"1px solid rgba(0,0,0,0.04)",padding:"0.75rem",borderRadius:"8px",display:"flex",flexDirection:"column",gap:"0.4rem"},children:[(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"6px"},children:[(0,i.jsx)("i",{className:"fa-brands fa-telegram",style:{color:"#0088cc",fontSize:"1.15rem"}}),(0,i.jsx)("span",{style:{fontSize:"0.85rem",fontWeight:"700",color:"var(--text-dark)"},children:"Telegram"})]}),(0,i.jsx)("div",{style:{fontSize:"0.72rem",color:"#64748b",fontWeight:"600"},children:"● Click to check status"}),(0,i.jsxs)("a",{href:`https://t.me/${c}`,target:"_blank",rel:"noopener noreferrer",style:{fontSize:"0.72rem",color:"var(--primary)",fontWeight:"700",textDecoration:"none",marginTop:"0.5rem",display:"inline-flex",alignItems:"center",gap:"4px"},children:["Verify Telegram ",(0,i.jsx)("i",{className:"fa-solid fa-chevron-right",style:{fontSize:"0.6rem"}})]})]})]})]}),a.notes&&(0,i.jsxs)("div",{style:{background:"#fffbeb",border:"1px solid #fef3c7",padding:"1rem",borderRadius:"8px",display:"flex",gap:"0.5rem",alignItems:"flex-start"},children:[(0,i.jsx)("i",{className:"fa-solid fa-circle-info",style:{color:"#d97706",marginTop:"2px"}}),(0,i.jsxs)("div",{children:[(0,i.jsx)("div",{style:{fontSize:"0.75rem",color:"#b45309",fontWeight:"600",textTransform:"uppercase"},children:"Special Instructions"}),(0,i.jsx)("p",{style:{margin:"0.2rem 0 0 0",fontSize:"0.9rem",color:"#78350f",fontStyle:"italic",lineHeight:"1.4"},children:a.notes})]})]})]}),(0,i.jsxs)("div",{style:{padding:"1rem 1.5rem",background:"#fcfdfe",borderTop:"1px solid rgba(0,0,0,0.05)",display:"flex",justifyContent:"space-between",alignItems:"center"},children:[(0,i.jsxs)("button",{onClick:()=>{let i,t,a,s,o;return i=window.open("","_blank"),t=v(r.service),a=e(r.pickupDate),s=e(r.createdAt),o=u(t.services),void(i.document.write(`
      <html>
        <head>
          <title>Receipt - Booking #${r.id.slice(0,8)}</title>
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
              <div style="font-size: 12px; color: #64748b; text-align: right; margin-top: 4px;">Order ID: #${r.id.slice(0,8)}</div>
            </div>
          </div>

          <div class="grid">
            <div>
              <div class="section-title">Customer Information</div>
              <div class="info-group">
                <div class="info-label">Name</div>
                <div class="info-value">${r.customerName}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Email</div>
                <div class="info-value">${r.email}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Phone</div>
                <div class="info-value">${r.phone}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Booking Status</div>
                <div style="margin-top: 5px;">
                  <span class="badge badge-${r.status.toLowerCase()}">${r.status}</span>
                </div>
              </div>
            </div>

            <div>
              <div class="section-title">Logistics & Timing</div>
              <div class="info-group">
                <div class="info-label">Scheduled Pickup</div>
                <div class="info-value">${a}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Booking Placed On</div>
                <div class="info-value">${s}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Pickup Method</div>
                <div class="info-value">${t.pickupMethod||"N/A"}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Preferred Time</div>
                <div class="info-value">${t.time||"N/A"}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Payment Method</div>
                <div class="info-value">${t.paymentMethod||"N/A"}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Express Option</div>
                <div class="info-value">${t.expressService||"Standard"}</div>
              </div>
            </div>
          </div>

          <div class="section-title">Requested Services</div>
          <div style="background: #f8fafc; padding: 20px 20px 12px 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 30px;">
            ${0===o.length?"None selected":o.map(e=>`<span class="service-badge">${e}</span>`).join("")}
          </div>

          <div class="grid">
            <div>
              <div class="section-title">Pickup Address</div>
              <div class="info-value" style="line-height: 1.5; font-size: 14px;">${t.address||"N/A"}</div>
              ${t.roomNo?`<div class="room-box">Room ${t.roomNo}</div>`:""}
            </div>
            <div>
              <div class="section-title">Delivery Address</div>
              <div class="info-value" style="line-height: 1.5; font-size: 14px;">${t.delivery||"N/A"}</div>
              ${t.deliveryRoomNo?`<div class="room-box">Room ${t.deliveryRoomNo}</div>`:""}
            </div>
          </div>

          ${t.notes?`
            <div style="margin-top: 30px;">
              <div class="section-title">Special Instructions / Notes</div>
              <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 15px; border-radius: 8px; font-style: italic; line-height: 1.5; font-size: 14px;">
                ${t.notes}
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
    `),i.document.close())},style:{background:"rgba(34, 41, 69, 0.06)",color:"var(--primary)",border:"none",padding:"0.4rem 1rem",borderRadius:"8px",fontSize:"0.8rem",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"6px",transition:"all 0.2s ease"},onMouseEnter:e=>e.currentTarget.style.background="rgba(34, 41, 69, 0.12)",onMouseLeave:e=>e.currentTarget.style.background="rgba(34, 41, 69, 0.06)",children:[(0,i.jsx)("i",{className:"fa-solid fa-file-pdf"})," Export PDF / Receipt"]}),"PENDING"===r.status&&(0,i.jsxs)("div",{style:{display:"flex",gap:"0.5rem"},children:[(0,i.jsxs)("button",{onClick:()=>h(r.id,"CLOSED"),style:{background:"#10b981",color:"white",border:"none",padding:"0.4rem 1rem",borderRadius:"8px",fontSize:"0.8rem",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px",boxShadow:"0 2px 4px rgba(16, 185, 129, 0.2)"},children:[(0,i.jsx)("i",{className:"fa-solid fa-check"})," Close Order"]}),(0,i.jsxs)("button",{onClick:()=>h(r.id,"CANCELLED"),style:{background:"transparent",border:"1px solid #ef4444",color:"#ef4444",padding:"0.4rem 1rem",borderRadius:"8px",fontSize:"0.8rem",fontWeight:"600",cursor:"pointer",display:"flex",alignItems:"center",gap:"4px"},children:[(0,i.jsx)("i",{className:"fa-solid fa-xmark"})," Cancel Order"]})]})]})]},r.id)})})})]})}])}]);