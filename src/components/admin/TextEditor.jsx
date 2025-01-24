
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useEffect, useRef, useState } from 'react';
import { BASE_URL } from '../constant';

const uploadToS3 = async (file, contentType) => {
  console.log('Uploading to S3:', file);
  try {
    const res = await fetch(`${BASE_URL}company/questions/get-signed-url?contentType=${file.type}&ext=${file.name.split('.').pop()}`, {
      headers: {
        "Authorization": "Bearer " + sessionStorage.getItem("token"),
      },
    });
    const data = await res.json();
    console.log("res = ", data)
    await fetch(data.data?.url, {
      method: "PUT",
      body: file,
      headers: {
        'Content-Type': contentType,
      },
    });
    console.log("respos", data)
    console.log("Uploaded to S3:", data.data.location);
    return data.data.location;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    return null;
  }
};


const handleUpload = async (file) => {
  console.log("file = ", file)
  const contentType = file.type;
  const uploadedUrl = await uploadToS3(file, contentType);
  return uploadedUrl;
};

const BlockEmbed = Quill.import('blots/block/embed');

class AudioBlot extends BlockEmbed {
  static create(value) {
    const node = super.create();
    node.setAttribute('controls', '');
    node.setAttribute('src', value);
    return node;
  }

  static value(node) {
    return node.getAttribute('src');
  }
}

AudioBlot.blotName = 'audio';
AudioBlot.tagName = 'audio';
Quill.register(AudioBlot);

const customIcons = Quill.import('ui/icons');
customIcons['audio'] = '<svg viewBox="0 0 18 18"><path d="M9 3v12l-3-3H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h2l3-3zm5 3v6a3 3 0 0 1-3 3v-2a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1V4a3 3 0 0 1 3 3z"></path></svg>';

const MyCustomUploadAdapterPlugin = (quill) => {
  quill.getModule('toolbar').addHandler('image', () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      console.log(input.files)
      const file = input.files[0];
      const range = quill.getSelection();
      const uploadedUrl = await handleUpload(file);
      if (uploadedUrl) {
        quill.insertEmbed(range.index, 'image', uploadedUrl);
        const [image] = quill.root.querySelectorAll(`img[src="${uploadedUrl}"]`);
        if (image) {
          image.setAttribute('width', '150');
          image.setAttribute('height', '100');
        }
      }
    };
  });

  quill.getModule('toolbar').addHandler('video', () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'video/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      const range = quill.getSelection();
      const uploadedUrl = await handleUpload(file);
      if (uploadedUrl) {
        quill.insertEmbed(range.index, 'video', uploadedUrl);
      }
    };
  });

  quill.getModule('toolbar').addHandler('audio', () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'audio/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      const range = quill.getSelection();
      const uploadedUrl = await handleUpload(file);
      if (uploadedUrl) {
        quill.insertEmbed(range.index, 'audio', uploadedUrl);
      }
    };
  });
};

const TextEditor = ({ content, setContent, placeholder }) => {
  const quillRef = useRef(null);
  const quillInstance = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (quillInstance.current) return;

    quillInstance.current = new Quill(quillRef.current, {
      theme: 'snow',
      placeholder: placeholder,
      modules: {
        toolbar: {
          container: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            ['image', 'video', 'audio'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }]
          ],
          handlers: {
            'audio': () => {
              const input = document.createElement('input');
              input.setAttribute('type', 'file');
              input.setAttribute('accept', 'audio/*');
              input.click();

              input.onchange = async () => {
                const file = input.files[0];
                const range = quillInstance.current.getSelection();
                const uploadedUrl = await handleUpload(file);
                if (uploadedUrl) {
                  quillInstance.current.insertEmbed(range.index, 'audio', uploadedUrl);
                }
              };
            }
          }
        }
      }
    });

    quillInstance.current.clipboard.dangerouslyPasteHTML(content);

    quillInstance.current.on('text-change', () => {
      setContent(quillInstance.current.root.innerHTML);
    });

    MyCustomUploadAdapterPlugin(quillInstance.current, setLoading);
  }, [content, setContent, placeholder]);

  return (
    <>
      {loading && <div className="loader">Uploading...</div>}
      <div ref={quillRef} />
    </>
  )
};

export default TextEditor;
