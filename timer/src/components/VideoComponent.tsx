
const VideoComponent = ({url} : {url: string}) => {
  return (
    <div className="absolute inset-0 w-full h-full z-[-1] overflow-hidden">
       <video
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      >
        <source src={url} type="video/mp4" />
      </video>
    </div>
  )
}

export default VideoComponent
