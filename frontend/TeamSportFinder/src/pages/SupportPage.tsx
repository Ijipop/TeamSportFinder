import { Container, Typography, Box } from "@mui/material";

const SupportPage = () =>
{
	return (
		<Container maxWidth="lg" sx={{ mt: { xs: 8, sm: 10 }, px: { xs: 2, sm: 3 } }}>
			<Typography variant="h4" component="h1" gutterBottom align="center">
				{"Support"}
			</Typography>
			<Typography
				variant="body1"
				paragraph
				align="center"
				sx={{
					mb: 4,
					fontSize: { xs: "0.9rem", sm: "1rem" },
					px: { xs: 1, sm: 0 },
				}}
			>
				{"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sollicitudin lorem ut tincidunt varius. In vel tortor malesuada, posuere eros vitae, cursus arcu. Fusce dapibus fringilla dolor vel rhoncus. Aliquam rutrum feugiat elit, ut euismod est elementum vel. Nam vel tellus quis turpis pulvinar laoreet vitae vel elit. Proin elementum maximus elementum. Duis id nulla non tortor mattis auctor. Integer sed urna eu risus maximus efficitur non in mi. Nam porttitor, magna sed aliquam dapibus, diam urna egestas enim, quis bibendum justo velit sed nulla. Curabitur ullamcorper interdum eros mollis vestibulum. Duis nec sodales risus. Praesent vel libero in dui egestas dictum. Aliquam luctus lorem in pellentesque consequat. Ut rhoncus pharetra efficitur. Cras tempus est quis ligula molestie placerat."}
			</Typography>
			<Typography
				variant="body1"
				paragraph
				align="center"
				sx={{
					mb: 4,
					fontSize: { xs: "0.9rem", sm: "1rem" },
					px: { xs: 1, sm: 0 },
				}}
			>
				{"Nullam gravida consectetur vehicula. In eu lacus laoreet tellus dictum posuere non et nisl. Sed tincidunt in purus quis elementum. Nam vestibulum sagittis turpis sit amet bibendum. Curabitur ante metus, viverra mattis lorem ut, ornare fermentum turpis. Cras mattis accumsan dolor tempus sagittis. Ut interdum magna arcu, id volutpat erat convallis et. Quisque at neque pharetra, sollicitudin risus id, euismod ante. Nulla congue nibh non auctor ornare. Vivamus lobortis sapien id suscipit tristique. Suspendisse interdum est in nibh imperdiet dapibus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Cras porta lectus ut augue lacinia, pretium ultrices sapien euismod. Sed interdum, tortor sit amet placerat tristique, mauris velit sagittis mauris, quis mollis magna lorem et ligula. Proin laoreet feugiat turpis, cursus fringilla mi. Mauris nec massa nunc."}
			</Typography>
			<Typography
				variant="body1"
				paragraph
				align="center"
				sx={{
					mb: 4,
					fontSize: { xs: "0.9rem", sm: "1rem" },
					px: { xs: 1, sm: 0 },
				}}
			>
				{"Cras malesuada, leo nec faucibus blandit, lorem sem ornare eros, nec viverra dolor velit id lectus. Mauris condimentum porta velit eget eleifend. Cras et orci eget magna vulputate luctus. Suspendisse in interdum mi. Aenean in auctor dolor, sit amet bibendum nulla. Aenean eget augue sagittis, lacinia erat ut, pharetra elit. Duis porttitor tortor consectetur, vehicula sem ac, faucibus dolor. Aenean vehicula velit sed neque auctor auctor. Aliquam at dapibus nunc. Etiam consequat turpis massa, quis condimentum odio euismod id. Nam nec luctus justo, et aliquet eros."}
			</Typography>
		</Container>
	);
};

export { SupportPage };
