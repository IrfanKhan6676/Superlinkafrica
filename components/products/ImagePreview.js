// utils.js
export function previewImages() {
    let fileInput = document.getElementById("file-input");
let imageContainer = document.getElementById("images");
let numOfFiles = document.getElementById("num-of-files");
  imageContainer.innerHTML = "";
  numOfFiles.style.display = "";
  numOfFiles.textContent = `${fileInput.files.length} Files Selected`;

  for (let i of fileInput.files) {
    let reader = new FileReader();

    let figure = document.createElement("figure");
    let figCap = document.createElement("figcaption");
    figCap.innerText = i.name;

    figure.style.width = "150px";
    figCap.style.textAlign = "center";
    figCap.style.fontSize = "13px";
    figCap.style.marginTop = "0.5vmin";

    figure.appendChild(figCap);

    reader.onload = () => {
      let img = document.createElement("img");
      img.src = reader.result;
      img.style.width = "150px";
      figure.insertBefore(img, figCap);
    };

    imageContainer.appendChild(figure);
    reader.readAsDataURL(i);
  }
}
