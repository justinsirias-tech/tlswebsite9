module.exports=[64790,e=>e.a(async(t,r)=>{try{var o=e.i(89171),i=e.i(4791),a=e.i(2443),n=e.i(29508),s=e.i(34731),l=t([i,a]);async function d(e){if(!e)return"";try{let t=process.env.GEMINI_API_KEY;if(!t)return console.warn("GEMINI_API_KEY is missing. Skipping booking translation."),e;let r=new s.GoogleGenAI({apiKey:t}),o=`You are a helper for a premium laundry service in Thailand called "That Laundry Shop".
Your job is to translate booking details (which may contain Thai or Chinese service names, transport logistics, and customer notes) into clean, professional English so our staff can read it.

Here is the raw booking text:
"""
${e}
"""

Instructions:
1. Translate all non-English text (such as Thai or Chinese) into English.
2. Keep the original structure of the booking details (e.g. Services, Address, Delivery, Pickup Method, Time, Notes).
3. If the text is already entirely in English, return it exactly as it is without any changes.
4. Output ONLY the translated text. Do not include markdown code block backticks (like \`\`\`), "Here is the translation:", or any extra commentary.`,i=await r.models.generateContent({model:"gemini-2.5-flash",contents:o}),a=i.text?.trim();if(a)return a}catch(e){console.error("Booking translation failed:",e)}return e}async function p(e){try{var t;let r,o,i=process.env.SMTP_HOST&&process.env.SMTP_USER&&process.env.SMTP_PASS&&"YOUR_GOOGLE_APP_PASSWORD"!==process.env.SMTP_PASS;if(i){let e=parseInt(process.env.SMTP_PORT||"587",10);r=n.default.createTransport({pool:!0,host:process.env.SMTP_HOST,port:e,secure:465===e,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}}),console.log(`Using custom SMTP server: ${process.env.SMTP_HOST}:${e}`)}else{console.log("No SMTP environment credentials found. Falling back to test SMTP (ethereal.email)...");let e=await n.default.createTestAccount();r=n.default.createTransport({host:"smtp.ethereal.email",port:587,secure:!1,auth:{user:e.user,pass:e.pass}})}let a=(t=e.service,o={services:"",address:"",delivery:"",pickupMethod:"",time:"",notes:"",roomNo:"",deliveryRoomNo:""},t&&(t.split("\n").forEach(e=>{let t=e.trim();if(t.startsWith("Services:"))o.services=t.replace("Services:","").trim();else if(t.startsWith("Address:")){let e=t.replace("Address:","").trim(),r=e.match(/Room\s+([^,]+)/i);r?(o.roomNo=r[1].trim(),o.address=e.replace(/,?\s*Room\s+[^,]+,?/i,"").trim()):o.address=e}else if(t.startsWith("Delivery:")){let e=t.replace("Delivery:","").trim(),r=e.match(/Room\s+([^,]+)/i);r?(o.deliveryRoomNo=r[1].trim(),o.delivery=e.replace(/,?\s*Room\s+[^,]+,/i,"").trim()):o.delivery=e}else t.startsWith("Pickup Method:")?o.pickupMethod=t.replace("Pickup Method:","").trim():t.startsWith("Time:")?o.time=t.replace("Time:","").trim():t.startsWith("Notes:")&&(o.notes=t.replace("Notes:","").trim())}),!o.services&&t&&(t.includes("Services:")?o.services="None selected":o.services=t)),o),s=function(e){if(!e)return[];if(e.includes(";"))return e.split(";").map(e=>e.trim()).filter(Boolean);let t=new Set,r=e.toLowerCase().replace(/\s*\/\s*/g,"/").replace(/\s*&\s*/g,"&");return([{canonical:"Wash & Fold (Weight)",patterns:["wash & fold","wash and fold","wash & fold (weight)","wash/fold"]},{canonical:"Wash, Iron & Fold (Weight)",patterns:["wash, iron & fold","wash, iron and fold","wash/iron/fold","wash, iron & fold (weight)","wash/iron/fold (weight)"]},{canonical:"Wash, Iron & Hang (Weight)",patterns:["wash, iron & hang","wash, iron and hang","wash/iron/hang","wash, iron & hang (weight)","wash/iron/hang (weight)"]},{canonical:"Dry cleaning",patterns:["dry cleaning","dry clean","dry-cleaning"]},{canonical:"Linens & Beddings",patterns:["linens & beddings","linens and beddings","linens/beddings","linens","beddings","bedding"]},{canonical:"Mixed Service",patterns:["mixed service","mixed"]},{canonical:"Ironing & Pressing only",patterns:["ironing & pressing only","ironing & pressing","ironing and pressing","ironing only","pressing only"]},{canonical:"Others",patterns:["others","other"]}].forEach(e=>{for(let o of e.patterns){let i=o.toLowerCase().replace(/\s*\/\s*/g,"/").replace(/\s*&\s*/g,"&");if(r.includes(i)){t.add(e.canonical);break}}}),t.size>0)?Array.from(t):e.split(",").map(e=>e.trim()).filter(Boolean)}(a.services),l=s.length>0?s.map(e=>`
          <span style="display: inline-block; background-color: #f8fafc; border: 1px solid #cbd5e1; color: #1e293b; padding: 5px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; margin-right: 6px; margin-bottom: 8px;">
            ✓ ${e}
          </span>
        `).join(""):'<span style="color: #64748b; font-size: 14px;">No specified services.</span>',d=new Date(e.pickupDate),p=String(d.getDate()).padStart(2,"0"),c=String(d.getMonth()+1).padStart(2,"0"),u=d.getFullYear(),g=`${p}/${c}/${u}`,h=`
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 10px; color: #1e293b;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); overflow: hidden; border: 1px solid #eaeaea;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #222945 0%, #3a4b7c 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;">
              That Laundry Shop
            </h1>
            <p style="color: #cbd5e1; margin: 5px 0 0 0; font-size: 12px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;">
              Premium Laundry & Dry Cleaning
            </p>
          </div>

          <!-- Body -->
          <div style="padding: 35px 25px;">
            <h2 style="color: #222945; margin-top: 0; font-size: 20px; font-weight: 700; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 20px;">
              Booking Request Received!
            </h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
              Hi <strong>${e.customerName}</strong>,<br><br>
              Thank you for choosing That Laundry Shop! We have successfully received your request. Our team will review the details and contact you shortly to confirm the scheduled pickup.
            </p>
            
            <!-- Date / Method Grid -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 25px;">
              <tr>
                <td width="50%" valign="top" style="padding-right: 8px;">
                  <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #edf2f7; min-height: 75px;">
                    <div style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
                      Scheduled Pickup
                    </div>
                    <div style="font-size: 13px; color: #1e293b; font-weight: 600;">
                      ${g}
                    </div>
                    <div style="font-size: 12px; color: #475569; margin-top: 3px;">
                      Time: <strong>${a.time||"Not specified"}</strong>
                    </div>
                  </div>
                </td>
                <td width="50%" valign="top" style="padding-left: 8px;">
                  <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #edf2f7; min-height: 75px;">
                    <div style="font-size: 10px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
                      Pickup Method
                    </div>
                    <div style="font-size: 13px; color: #1e293b; font-weight: 600; line-height: 1.3;">
                      ${a.pickupMethod||"Not specified"}
                    </div>
                    <div style="font-size: 12px; color: #475569; margin-top: 3px;">
                      Contact: <strong>${e.phone.split(" |")[0]}</strong>
                    </div>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Services Requested -->
            <div style="margin-bottom: 25px;">
              <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">
                Services Requested
              </div>
              <div style="margin-top: 5px;">
                ${l}
              </div>
            </div>

            <!-- Addresses Grid -->
            <div style="margin-bottom: 25px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tr>
                  <td width="50%" valign="top" style="padding-right: 15px; padding-bottom: 15px;">
                    <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
                      Pickup Address
                    </div>
                    <div style="font-size: 13px; color: #1e293b; line-height: 1.4;">
                      ${a.address||"No address provided"}
                    </div>
                    ${a.roomNo?`
                    <div style="display: inline-block; background: #fffbeb; border: 1px solid #fef3c7; color: #b45309; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 700; margin-top: 6px; text-transform: uppercase;">
                      Room ${a.roomNo}
                    </div>`:""}
                  </td>
                  <td width="50%" valign="top" style="padding-left: 15px; padding-bottom: 15px; border-left: 1px solid #f1f5f9;">
                    <div style="font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
                      Delivery Address
                    </div>
                    <div style="font-size: 13px; color: #1e293b; line-height: 1.4;">
                      ${a.delivery||"Same as pickup"}
                    </div>
                    ${a.deliveryRoomNo?`
                    <div style="display: inline-block; background: #fffbeb; border: 1px solid #fef3c7; color: #b45309; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 700; margin-top: 6px; text-transform: uppercase;">
                      Room ${a.deliveryRoomNo}
                    </div>`:""}
                  </td>
                </tr>
              </table>
            </div>

            <!-- Notes -->
            ${a.notes?`
            <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 12px 15px; border-radius: 8px; margin-bottom: 25px;">
              <div style="font-size: 10px; color: #b45309; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
                Special Instructions
              </div>
              <div style="font-size: 13px; color: #78350f; font-style: italic; line-height: 1.4;">
                "${a.notes}"
              </div>
            </div>`:""}

            <!-- Verification Policy Card -->
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 8px;">
              <div style="font-weight: 700; color: #1e40af; font-size: 14px; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                💡 Order Verification Policy
              </div>
              <ul style="margin: 0; padding-left: 18px; color: #1e3a8a; font-size: 13px; line-height: 1.5;">
                <li>Your order is currently pending review.</li>
                <li>Our concierge team will contact you shortly to confirm the request and details.</li>
              </ul>
            </div>

          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 25px; text-align: center; font-size: 12px; color: #64748b;">
            <p style="margin: 0 0 8px 0;">
              Need urgent help? Hotline: <a href="tel:+66946916668" style="color: #222945; font-weight: 700; text-decoration: none;">+66 94 691 6668</a>
            </p>
            <p style="margin: 0; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em;">
              \xa9 2026 That Laundry Shop. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    `,f=process.env.SMTP_FROM||'"That Laundry Shop" <no-reply@thatlaundryshop.com>',m={from:f,to:e.email,subject:"Your Laundry Booking Request Received - That Laundry Shop",html:h},v=await r.sendMail(m);console.log("Customer email sent! Message ID:",v.messageId);try{let t={from:f,to:"sales@thatlaundryshop.com",cc:["thatlaundryshopbooking@gmail.com","thatlaundryshopcso@gmail.com"],subject:`[New Booking] ${e.customerName} - That Laundry Shop`,html:h},o=await r.sendMail(t);console.log("Admin notification email sent! Message ID:",o.messageId)}catch(e){console.error("Failed to send admin notification email:",e)}if(i)return null;{let e=n.default.getTestMessageUrl(v);return console.log("Test Email successfully sent! Preview it here:",e),e}}catch(e){return console.error("Email sending failed:",e),null}}async function c(e){try{let t=await e.json();if(!t.email)return o.NextResponse.json({error:"Email is required"},{status:400});let r=await d(t.service),a=await i.default.booking.create({data:{customerName:t.customerName,email:t.email,phone:t.phone,pickupDate:new Date(t.pickupDate),service:r,memberId:t.memberId||null}});return console.log("Webapp Job sync is disabled via ENABLE_WEBAPP_SYNC=false. Skipping POS Job creation."),(0,o.after)(async()=>{try{await p(a)}catch(e){console.error("Failed to send background email:",e)}}),o.NextResponse.json({success:!0,booking:a})}catch(e){return console.error("Booking creation error:",e),o.NextResponse.json({error:"Failed to create booking"},{status:500})}}[i,a]=l.then?(await l)():l,e.s(["POST",0,c]),r()}catch(e){r(e)}},!1),72278,e=>e.a(async(t,r)=>{try{var o=e.i(47909),i=e.i(74017),a=e.i(96250),n=e.i(59756),s=e.i(61916),l=e.i(74677),d=e.i(69741),p=e.i(16795),c=e.i(87718),u=e.i(95169),g=e.i(47587),h=e.i(66012),f=e.i(70101),m=e.i(26937),v=e.i(10372),x=e.i(93695);e.i(52474);var y=e.i(220),b=e.i(64790),w=t([b]);[b]=w.then?(await w)():w;let S=new o.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/booking/route",pathname:"/api/booking",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/booking/route.js",nextConfigOutput:"standalone",userland:b,...{}}),{workAsyncStorage:k,workUnitAsyncStorage:T,serverHooks:E}=S;async function R(e,t,r){r.requestMeta&&(0,n.setRequestMeta)(e,r.requestMeta),S.isDev&&(0,n.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let o="/api/booking/route";o=o.replace(/\/index$/,"")||"/";let a=await S.prepare(e,t,{srcPage:o,multiZoneDraftMode:!1});if(!a)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:b,deploymentId:w,params:R,nextConfig:k,parsedUrl:T,isDraftMode:E,prerenderManifest:P,routerServerContext:N,isOnDemandRevalidate:A,revalidateOnlyGenerated:C,resolvedPathname:M,clientReferenceManifest:_,serverActionsManifest:O}=a,I=(0,d.normalizeAppPath)(o),$=!!(P.dynamicRoutes[I]||P.routes[M]),D=async()=>((null==N?void 0:N.render404)?await N.render404(e,t,T,!1):t.end("This page could not be found"),null);if($&&!E){let e=!!P.routes[M],t=P.dynamicRoutes[I];if(t&&!1===t.fallback&&!e){if(k.adapterPath)return await D();throw new x.NoFallbackError}}let z=null;!$||S.isDev||E||(z=M,z="/index"===z?"/":z);let H=!0===S.isDev||!$,q=$&&!H;O&&_&&(0,l.setManifestsSingleton)({page:o,clientReferenceManifest:_,serverActionsManifest:O});let U=e.method||"GET",L=(0,s.getTracer)(),W=L.getActiveScopeSpan(),B=!!(null==N?void 0:N.isWrappedByNextServer),F=!!(0,n.getRequestMeta)(e,"minimalMode"),j=(0,n.getRequestMeta)(e,"incrementalCache")||await S.getIncrementalCache(e,k,P,F);null==j||j.resetRequestCache(),globalThis.__incrementalCache=j;let G={params:R,previewProps:P.preview,renderOpts:{experimental:{authInterrupts:!!k.experimental.authInterrupts},cacheComponents:!!k.cacheComponents,supportsDynamicResponse:H,incrementalCache:j,cacheLifeProfiles:k.cacheLife,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,o,i)=>S.onRequestError(e,t,o,i,N)},sharedContext:{buildId:b,deploymentId:w}},K=new p.NodeNextRequest(e),Y=new p.NodeNextResponse(t),V=c.NextRequestAdapter.fromNodeNextRequest(K,(0,c.signalFromNodeResponse)(t));try{let a,n=async e=>S.handle(V,G).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=L.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let i=r.get("next.route");if(i){let t=`${U} ${i}`;e.setAttributes({"next.route":i,"http.route":i,"next.span_name":t}),e.updateName(t),a&&a!==e&&(a.setAttribute("http.route",i),a.updateName(t))}else e.updateName(`${U} ${o}`)}),l=async a=>{var s,l;let d=async({previousCacheEntry:i})=>{try{if(!F&&A&&C&&!i)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let o=await n(a);e.fetchMetrics=G.renderOpts.fetchMetrics;let s=G.renderOpts.pendingWaitUntil;s&&r.waitUntil&&(r.waitUntil(s),s=void 0);let l=G.renderOpts.collectedTags;if(!$)return await (0,h.sendResponse)(K,Y,o,G.renderOpts.pendingWaitUntil),null;{let e=await o.blob(),t=(0,f.toNodeOutgoingHttpHeaders)(o.headers);l&&(t[v.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==G.renderOpts.collectedRevalidate&&!(G.renderOpts.collectedRevalidate>=v.INFINITE_CACHE)&&G.renderOpts.collectedRevalidate,i=void 0===G.renderOpts.collectedExpire||G.renderOpts.collectedExpire>=v.INFINITE_CACHE?void 0:G.renderOpts.collectedExpire;return{value:{kind:y.CachedRouteKind.APP_ROUTE,status:o.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:i}}}}catch(t){throw(null==i?void 0:i.isStale)&&await S.onRequestError(e,t,{routerKind:"App Router",routePath:o,routeType:"route",revalidateReason:(0,g.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:A})},!1,N),t}},p=await S.handleResponse({req:e,nextConfig:k,cacheKey:z,routeKind:i.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:P,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:C,responseGenerator:d,waitUntil:r.waitUntil,isMinimalMode:F});if(!$)return null;if((null==p||null==(s=p.value)?void 0:s.kind)!==y.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==p||null==(l=p.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});F||t.setHeader("x-nextjs-cache",A?"REVALIDATED":p.isMiss?"MISS":p.isStale?"STALE":"HIT"),E&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let c=(0,f.fromNodeOutgoingHttpHeaders)(p.value.headers);return F&&$||c.delete(v.NEXT_CACHE_TAGS_HEADER),!p.cacheControl||t.getHeader("Cache-Control")||c.get("Cache-Control")||c.set("Cache-Control",(0,m.getCacheControlHeader)(p.cacheControl)),await (0,h.sendResponse)(K,Y,new Response(p.value.body,{headers:c,status:p.value.status||200})),null};B&&W?await l(W):(a=L.getActiveScopeSpan(),await L.withPropagatedContext(e.headers,()=>L.trace(u.BaseServerSpan.handleRequest,{spanName:`${U} ${o}`,kind:s.SpanKind.SERVER,attributes:{"http.method":U,"http.target":e.url}},l),void 0,!B))}catch(t){if(t instanceof x.NoFallbackError||await S.onRequestError(e,t,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,g.getRevalidateReason)({isStaticGeneration:q,isOnDemandRevalidate:A})},!1,N),$)throw t;return await (0,h.sendResponse)(K,Y,new Response(null,{status:500})),null}}e.s(["handler",0,R,"patchFetch",0,function(){return(0,a.patchFetch)({workAsyncStorage:k,workUnitAsyncStorage:T})},"routeModule",0,S,"serverHooks",0,E,"workAsyncStorage",0,k,"workUnitAsyncStorage",0,T]),r()}catch(e){r(e)}},!1)];

//# sourceMappingURL=_0_qq4xn._.js.map