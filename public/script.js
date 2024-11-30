
        document.getElementById('convert-form').addEventListener('submit', async function (event) {
            event.preventDefault();

            const formData = new FormData(this);
            const loadingIndicator = document.querySelector('.loading');
            const convertedImage = document.getElementById('converted-image');
            const downloadBtn = document.getElementById('download-btn');

            loadingIndicator.style.display = 'block';
            convertedImage.style.display = 'none';
            downloadBtn.style.display = 'none';

            try {
                const response = await fetch('/convert', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                // If there's an error, show it
                if (result.error) {
                    alert(result.error);
                    return;
                }

                // Hide loading and show the image
                loadingIndicator.style.display = 'none';
                convertedImage.src = `data:image/${result.fileName.split('.').pop()};base64,${result.image}`;
                convertedImage.style.display = 'block';

                // Set up download button
                downloadBtn.href = convertedImage.src;
                downloadBtn.download = result.fileName;
                downloadBtn.style.display = 'inline-block';

            } catch (error) {
                console.error(error);
                alert('An error occurred while processing the image.');
            }
        });
    