import Imagekit from "imagekit";

const imagekit = new Imagekit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY as string,
  privateKey: process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY as string,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL as string,
});

const uploadImage = async (file: File): Promise<string> => {
  const generatename = Math.random().toString(36).substring(7);
  const reader = new FileReader();
  reader.readAsDataURL(file);
  return new Promise<string>((resolve, reject) => {
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      try {
        const upload = await imagekit.upload({
          file: base64data,
          fileName: generatename,
          tags: ["story"],
        });
        resolve(upload.url);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

export default uploadImage;
