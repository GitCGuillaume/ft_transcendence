import React from "react";

export default function ActivePowerUpItem(props: { powerUp: any }) {
    let style = `game_powerups_item_img_${props.powerUp.color.toLowerCase()}`
  return (
    <div className="game_powerups_item">
      <img
        className={style}
        src={props.powerUp.imageURL}
        alt={props.powerUp.type}
      />
      <div className="game_powerups_container_text">{props.powerUp.lifespan}</div>
    </div>
  );
}
