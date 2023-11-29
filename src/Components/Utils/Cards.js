import Subtitle from "./Subtitle"

function TitleCard({title, children, topMargin, TopSideButtons}){
    return(
        <div className={"card p-6 bg-base-100 shadow-xl " + (topMargin || "mt-6")}>

          {/* Title for Card */}
            <Subtitle styleClass={TopSideButtons ? "inline-block" : ""}>
                <div style={{fontSize:50}}>
                    {title}
                    {/* Top side button, show only if present */}
                    {
                    TopSideButtons && <div className="inline-block float-right">{TopSideButtons}</div>
                    }
                </div>



            </Subtitle>

            <div className="divider mt-2"></div>
          
              {/** Card Body */}
              <div className='h-full w-full pb-6 bg-base-100'>
                  {children}
              </div>            
        </div>
        
    )
}

export default TitleCard