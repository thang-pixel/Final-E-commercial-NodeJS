
const createAvatarByName = (name) => {
  if (!name || name.trim().length === 0) {
    return '';
  }
 
  return `https://ui-avatars.com/api/?name=${name}&background=random&size=128`;
}

const imageUtils = {
  createAvatarByName,
};

export default imageUtils;